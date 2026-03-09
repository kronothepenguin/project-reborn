package cms

import (
	"database/sql"
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/storage"
)

func authRedirect(db *sql.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenCookie, err := r.Cookie(cookieSession)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}
			emailCookie, err := r.Cookie(cookieEmail)
			if err != nil {
				clearSessionCookies(w)
				next.ServeHTTP(w, r)
				return
			}

			exists, err := storage.New(db).VerifySession(r.Context(), storage.VerifySessionParams{
				Token: tokenCookie.Value,
				Email: emailCookie.Value,
			})
			if err != nil || exists == 0 {
				clearSessionCookies(w)
				next.ServeHTTP(w, r)
				return
			}

			refreshSession(w, r)
			http.Redirect(w, r, "/me", http.StatusFound)
		})
	}
}

func guard(db *sql.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenCookie, err := r.Cookie(cookieSession)
			if err != nil {
				http.Redirect(w, r, "/", http.StatusFound)
				return
			}
			emailCookie, err := r.Cookie(cookieEmail)
			if err != nil {
				clearSessionCookies(w)
				http.Redirect(w, r, "/", http.StatusFound)
				return
			}

			exists, err := storage.New(db).VerifySession(r.Context(), storage.VerifySessionParams{
				Token: tokenCookie.Value,
				Email: emailCookie.Value,
			})
			if err != nil || exists == 0 {
				destroySession(db, r.Context(), w, r)
				http.Redirect(w, r, "/", http.StatusFound)
				return
			}

			refreshSession(w, r)
			next.ServeHTTP(w, r)
		})
	}
}
