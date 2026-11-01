package housekeeping

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/housekeeping/internal/router"
	"github.com/kronothepenguin/project-reborn/packages/scheduler"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

//go:embed dist/*
var DistFS embed.FS

type Housekeeping struct {
	db      *sql.DB
	static  http.Handler
	resolve astro.Resolver
	// protect wraps every route with RealIP, cross-origin protection and the
	// session, so that housekeeping stays protected on a mux it shares.
	protect func(http.Handler) http.Handler
}

type Option func(*Housekeeping)

// New loads the settings from config.json and db, and panics when it cannot,
// like store.Must: housekeeping cannot serve without them.
func New(db *sql.DB, opts ...Option) *Housekeeping {
	cfg := config.Get()
	if err := settings.Load(context.Background(), cfg, db); err != nil {
		panic(fmt.Errorf("housekeeping: %w", err))
	}
	realIP, err := auth.RealIP(cfg.Proxy)
	if err != nil {
		panic(fmt.Errorf("housekeeping: %w", err))
	}
	crossOrigin := http.NewCrossOriginProtection()
	sessions := auth.Sessions(db)

	h := &Housekeeping{
		db: db,
		protect: func(next http.Handler) http.Handler {
			return realIP(crossOrigin.Handler(sessions(next)))
		},
	}
	for _, opt := range opts {
		opt(h)
	}
	scheduler.Every(1, scheduler.Minute, func(ctx context.Context) error {
		return auth.DeleteExpiredSessions(ctx, db)
	})
	return h
}

// Mount registers only /housekeeping/..., because / belongs to the CMS when they
// share a mux. Everything under the prefix is behind router.Staff, the static
// files too: /housekeeping/ also serves the built templates.
func (h *Housekeeping) Mount(mux *http.ServeMux) {
	r := router.New(router.Deps{Resolver: h.resolve, DB: h.db, Queries: store.New(h.db)})
	page := func(next http.Handler) http.Handler { return h.protect(r.Staff(next)) }
	holding := func(attr auth.Attribute, next http.HandlerFunc) http.Handler {
		return page(r.RequireAttribute(attr)(next))
	}

	mux.Handle("GET /housekeeping/{$}", page(http.HandlerFunc(r.HandleIndexView)))
	mux.Handle("POST /housekeeping/note", page(http.HandlerFunc(r.HandleNoteSave)))

	mux.Handle("GET /housekeeping/settings", holding(auth.HousekeepingSettings, r.HandleSettingsView))
	mux.Handle("POST /housekeeping/settings/{section}", holding(auth.HousekeepingSettings, r.HandleSettingsSave))

	mux.Handle("GET /housekeeping/access-groups", holding(auth.HousekeepingAccessGroups, r.HandleAccessGroupsView))
	mux.Handle("POST /housekeeping/access-groups", holding(auth.HousekeepingAccessGroups, r.HandleAccessGroupsCreate))
	mux.Handle("GET /housekeeping/access-groups/{id}", holding(auth.HousekeepingAccessGroups, r.HandleAccessGroupView))
	mux.Handle("POST /housekeeping/access-groups/{id}", holding(auth.HousekeepingAccessGroups, r.HandleAccessGroupSave))
	mux.Handle("POST /housekeeping/users/{id}/access-groups", holding(auth.HousekeepingAccessGroups, r.HandleUsersAccessGroupsSave))

	mux.Handle("GET /housekeeping/logs", holding(auth.HousekeepingLogs, r.HandleLogsView))

	mux.Handle("/housekeeping/", page(http.StripPrefix("/housekeeping", h.static)))
}

func WithStatic(next http.Handler) Option {
	return func(h *Housekeeping) {
		h.static = next
	}
}

func WithResolver(r astro.Resolver) Option {
	return func(h *Housekeeping) {
		h.resolve = r
	}
}
