package router

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleMeAlertsDismiss handles POST /me/alerts/{id}/dismiss. Another habbo's
// alert changes nothing.
func (r *Router) HandleMeAlertsDismiss(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	session, _ := auth.FromContext(ctx)
	_, err = r.deps.Queries.DismissAlert(ctx, store.DismissAlertParams{
		ID:          id,
		AvatarID:    session.AvatarID,
		DismissedAt: sql.NullTime{Time: time.Now().UTC(), Valid: true},
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, "/me", http.StatusSeeOther)
}
