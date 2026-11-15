package auth

import (
	"context"
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"slices"
	"strings"
)

// RequireSession lets through only requests with a session, so it must run
// inside Sessions. Without one, a request that accepts JSON gets 401 and a page
// is redirected to the home page, which has the login form.
func RequireSession(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, ok := FromContext(r.Context()); !ok {
			if strings.Contains(r.Header.Get("Accept"), "application/json") {
				http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
				return
			}
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// RequireAttribute lets through only users holding attr and answers 403 to the
// others. A request without a session is handled as by RequireSession.
func RequireAttribute(db *sql.DB, attr Attribute) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return RequireSession(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			session, _ := FromContext(r.Context())
			attributes, err := Attributes(r.Context(), db, session.UserID)
			if err != nil {
				logError("auth: attributes", err)
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
				return
			}
			if !slices.Contains(attributes, attr) {
				http.Error(w, http.StatusText(http.StatusForbidden), http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		}))
	}
}

// logError logs err under msg, unless the visitor abandoned the request: its
// error is then context.Canceled, and the request ends quietly.
func logError(msg string, err error) {
	if errors.Is(err, context.Canceled) {
		return
	}
	slog.Error(msg, "err", err)
}
