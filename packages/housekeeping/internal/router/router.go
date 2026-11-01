package router

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// dateFormat is Holo's date_full.
const dateFormat = "02-01-2006 15:04:05"

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

// RequireAttribute lets through only staff holding attr, inside Staff. Anyone
// else gets Holo's Access Denied page, in the layout, because they are staff.
func (r *Router) RequireAttribute(attr auth.Attribute) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			session, _ := auth.FromContext(req.Context())
			attributes, err := auth.Attributes(req.Context(), r.deps.DB, session.UserID)
			if err != nil {
				r.fail(w, err)
				return
			}
			if !slices.Contains(attributes, attr) {
				w.WriteHeader(http.StatusForbidden)
				astro.WriteTemplate(w, r.deps.Resolver, "access-denied.html", accessDeniedPage{chrome: r.chrome(req)})
				return
			}
			next.ServeHTTP(w, req)
		})
	}
}

type accessDeniedPage struct {
	chrome
}

// chrome holds what the housekeeping layout reads. Every page struct embeds it,
// because rendering fails without these fields.
type chrome struct {
	Habbo         string
	PreviousLogin string
	SiteName      string
	SiteURL       string
	Sections      []section
}

func (r *Router) chrome(req *http.Request) chrome {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	page := chrome{
		SiteName: settings.GetString("site.name"),
		SiteURL:  settings.GetString("site.url"),
		Sections: sectionsOver(settings.Declared()),
	}

	avatar, err := r.deps.Queries.GetAvatar(ctx, session.AvatarID)
	if err != nil {
		slog.Error("housekeeping: habbo", "err", err)
	}
	page.Habbo = avatar.Name

	// The newest sign-in is the one in use. A first sign-in has no other.
	previous, err := r.deps.Queries.GetPreviousLogin(ctx, session.UserID)
	switch {
	case err == nil:
		page.PreviousLogin = previous.CreatedAt.UTC().Format(dateFormat) + " from " + previous.IP
	case !errors.Is(err, sql.ErrNoRows):
		slog.Error("housekeeping: previous login", "err", err)
	}
	return page
}

func (r *Router) fail(w http.ResponseWriter, err error) {
	slog.Error("housekeeping", "err", err)
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}
