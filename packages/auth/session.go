package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const cookieName = "reborn_session"

// touchEvery bounds how often a request writes the sliding expiry.
const touchEvery = time.Minute

type Session struct {
	id        string
	UserID    int64
	AvatarID  int64
	Remember  bool
	ExpiresAt time.Time
}

type contextKey struct{}

// FromContext returns the session Sessions found for the request.
func FromContext(ctx context.Context) (Session, bool) {
	session, ok := ctx.Value(contextKey{}).(Session)
	return session, ok
}

// newToken returns a cookie value of 32 random bytes and its digest, the only
// form the database stores.
func newToken() (token, id string) {
	raw := make([]byte, 32)
	rand.Read(raw)
	sum := sha256.Sum256(raw)
	return base64.RawURLEncoding.EncodeToString(raw), hex.EncodeToString(sum[:])
}

func digest(token string) (string, bool) {
	raw, err := base64.RawURLEncoding.DecodeString(token)
	if err != nil || len(raw) != 32 {
		return "", false
	}
	sum := sha256.Sum256(raw)
	return hex.EncodeToString(sum[:]), true
}

// Sessions returns a middleware that puts the request's active session in the
// context for FromContext and slides its expiry forward, writing at most once
// a minute. A cookie without an active session is cleared.
func Sessions(db *sql.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			session, ok, err := loadSession(w, r, db)
			if err != nil {
				logError("auth: session", err)
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
				return
			}
			if ok {
				r = r.WithContext(context.WithValue(r.Context(), contextKey{}, session))
			}
			next.ServeHTTP(w, r)
		})
	}
}

func loadSession(w http.ResponseWriter, r *http.Request, db *sql.DB) (Session, bool, error) {
	cookie, err := r.Cookie(cookieName)
	if err != nil {
		return Session{}, false, nil
	}
	ctx := r.Context()
	q := store.New(db)
	id, ok := digest(cookie.Value)
	if !ok {
		clearCookie(ctx, q, w)
		return Session{}, false, nil
	}

	now := clock().UTC()
	row, err := q.GetActiveSession(ctx, store.GetActiveSessionParams{ID: id, Now: now})
	if errors.Is(err, sql.ErrNoRows) {
		clearCookie(ctx, q, w)
		return Session{}, false, nil
	}
	if err != nil {
		return Session{}, false, err
	}

	if now.Sub(row.LastSeenAt) >= touchEvery {
		lifetime := sessionLifetime(ctx, q, row.Remember)
		row.LastSeenAt, row.ExpiresAt = now, now.Add(lifetime)
		if err := q.TouchSession(ctx, store.TouchSessionParams{LastSeenAt: row.LastSeenAt, ExpiresAt: row.ExpiresAt, ID: id}); err != nil {
			return Session{}, false, err
		}
		if row.Remember {
			setCookie(ctx, q, w, cookie.Value, true, lifetime)
		}
	}
	return Session{id: id, UserID: row.UserID, AvatarID: row.AvatarID, Remember: row.Remember, ExpiresAt: row.ExpiresAt}, true, nil
}

// DeleteExpiredSessions removes the sessions past their expiry. A program that
// serves sessions runs it on the scheduler.
func DeleteExpiredSessions(ctx context.Context, db *sql.DB) error {
	if _, err := store.New(db).PurgeExpiredSessions(ctx, clock().UTC()); err != nil {
		return fmt.Errorf("auth: delete expired sessions: %w", err)
	}
	return nil
}

// setCookie writes the session cookie. Only a remember-me cookie outlives the
// browser, so only it carries a Max-Age.
func setCookie(ctx context.Context, q *store.Queries, w http.ResponseWriter, token string, remember bool, lifetime time.Duration) {
	cookie := &http.Cookie{
		Name:     cookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   settings.Bool(ctx, q, "auth.secureCookies"),
		SameSite: http.SameSiteLaxMode,
	}
	if remember {
		cookie.MaxAge = int(lifetime / time.Second)
	}
	http.SetCookie(w, cookie)
}

func clearCookie(ctx context.Context, q *store.Queries, w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Path:     "/",
		HttpOnly: true,
		Secure:   settings.Bool(ctx, q, "auth.secureCookies"),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}
