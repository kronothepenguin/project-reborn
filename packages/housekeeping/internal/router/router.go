package router

import (
	"database/sql"
	"log/slog"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// Deps are the shared services every handler can use.
type Deps struct {
	Resolver astro.Resolver
	DB       *sql.DB
	Queries  *store.Queries
}

type Router struct {
	deps Deps
}

func New(deps Deps) *Router {
	return &Router{deps: deps}
}

// Staff lets through only users holding housekeeping.access. Housekeeping has no
// login: a guest goes to the CMS, at site.url because a housekeeping running
// alone has no /. A banned user loses the session, as on every CMS page, or a ban
// would not reach someone who only opens housekeeping.
func (r *Router) Staff(next http.Handler) http.Handler {
	enter := auth.RequireAttribute(r.deps.DB, auth.HousekeepingAccess)(next)
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		session, ok := auth.FromContext(req.Context())
		if !ok {
			http.Redirect(w, req, settings.GetString("site.url"), http.StatusSeeOther)
			return
		}
		ban, err := auth.ActiveBan(req.Context(), r.deps.DB, session.UserID, auth.ClientIP(req))
		if err != nil {
			r.fail(w, err)
			return
		}
		if ban != nil {
			if err := auth.Logout(w, req, r.deps.DB); err != nil {
				r.fail(w, err)
				return
			}
			http.Error(w, http.StatusText(http.StatusForbidden), http.StatusForbidden)
			return
		}
		enter.ServeHTTP(w, req)
	})
}

func (r *Router) fail(w http.ResponseWriter, err error) {
	slog.Error("housekeeping", "err", err)
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}
