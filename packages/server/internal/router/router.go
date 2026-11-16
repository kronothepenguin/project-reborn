// Package router serves the game's /api/, which programs run apart from the
// game call to tell it of a change it must show live (decision reborn/0005).
package router

import (
	"crypto/subtle"
	"database/sql"
	"log/slog"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/services"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Header carries the secret of the api_secret table on every call.
const Header = "X-Reborn-Secret"

// Deps are what the handlers share.
type Deps struct {
	DB     *sql.DB
	Habbos services.Habbos
}

type Router struct {
	deps Deps
}

func New(deps Deps) *Router {
	return &Router{deps: deps}
}

// Secret answers 404 to a request without the secret of api_secret, so the
// /api/ shows nothing to whoever lacks it. The secret is read on each request,
// so a hotel whose update has not run yet answers 404 until it does.
func (r *Router) Secret(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		sent := req.Header.Get(Header)
		if sent == "" {
			http.NotFound(w, req)
			return
		}
		secret, err := store.New(r.deps.DB).GetAPISecret(req.Context())
		if err != nil {
			slog.Error("server: api: read the secret: " + err.Error())
			http.NotFound(w, req)
			return
		}
		if subtle.ConstantTimeCompare([]byte(sent), []byte(secret)) != 1 {
			http.NotFound(w, req)
			return
		}
		next.ServeHTTP(w, req)
	})
}
