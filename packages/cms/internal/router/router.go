package router

import (
	"context"
	"database/sql"
	"log/slog"
	"net/http"
	"slices"

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

// hotelStatus holds what the signed-out layout reads. The hotel stays offline
// until the game server exists.
type hotelStatus struct {
	Name            string
	ShortName       string
	Online          bool
	OnlineCount     int
	RegisteredUsers int64
	Staff           bool
	HousekeepingURL string
}

func (r *Router) hotelStatus(ctx context.Context) hotelStatus {
	registered, err := r.deps.Queries.CountAvatars(ctx)
	if err != nil {
		slog.Error("cms: count habbos", "err", err)
	}
	return hotelStatus{
		Name:            settings.GetString("site.name"),
		ShortName:       settings.GetString("site.shortName"),
		RegisteredUsers: registered,
		Staff:           r.holds(ctx, auth.HousekeepingAccess),
		HousekeepingURL: settings.GetString("site.housekeepingUrl"),
	}
}

// holds reports whether the visitor's user holds attribute.
func (r *Router) holds(ctx context.Context, attribute auth.Attribute) bool {
	session, ok := auth.FromContext(ctx)
	if !ok {
		return false
	}
	attributes, err := auth.Attributes(ctx, r.deps.DB, session.UserID)
	if err != nil {
		slog.Error("cms: attributes", "err", err)
		return false
	}
	return slices.Contains(attributes, attribute)
}

// Guest sends signed-in visitors to /me instead of next.
func Guest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if _, ok := auth.FromContext(req.Context()); ok {
			http.Redirect(w, req, "/me", http.StatusSeeOther)
			return
		}
		next.ServeHTTP(w, req)
	})
}

func (r *Router) invalid(w http.ResponseWriter, name string, data any) {
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, name, data)
}

func (r *Router) fail(w http.ResponseWriter, err error) {
	slog.Error("cms", "err", err)
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}
