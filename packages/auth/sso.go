package auth

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// SSOTicket returns the SSO ticket the request's session holds for its active
// habbo, making one when it holds none: the game server spends a ticket at login,
// and a switch of habbo drops it. A ticket is kept as text, so the client page can
// show it, and dies with its session (decision server/0030).
func SSOTicket(r *http.Request, db *sql.DB) (string, error) {
	session, ok := FromContext(r.Context())
	if !ok {
		return "", ErrNoSession
	}
	q := store.New(db)
	ticket, err := q.GetSessionSSOTicket(r.Context(), session.id)
	if err == nil {
		return ticket.ID, nil
	}
	if !store.IsNotFound(err) {
		return "", fmt.Errorf("auth: sso ticket: %w", err)
	}
	id, _ := newToken()
	err = q.CreateSSOTicket(r.Context(), store.CreateSSOTicketParams{ID: id, SessionID: session.id, AvatarID: session.AvatarID, IP: ClientIP(r), CreatedAt: clock().UTC()})
	if err != nil {
		return "", fmt.Errorf("auth: sso ticket: %w", err)
	}
	return id, nil
}
