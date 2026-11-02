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
	mux.Handle("POST /housekeeping/logout", page(http.HandlerFunc(r.HandleLogout)))

	mux.Handle("GET /housekeeping/settings", holding(auth.HousekeepingSettings, r.HandleSettingsView))
	mux.Handle("POST /housekeeping/settings/{section}", holding(auth.HousekeepingSettings, r.HandleSettingsSave))

	mux.Handle("GET /housekeeping/access-groups", holding(auth.HousekeepingAccessGroups, r.HandleAccessGroupsView))
	mux.Handle("POST /housekeeping/access-groups", holding(auth.HousekeepingAccessGroups, r.HandleAccessGroupsCreate))
	mux.Handle("GET /housekeeping/access-groups/{id}", holding(auth.HousekeepingAccessGroups, r.HandleAccessGroupView))
	mux.Handle("POST /housekeeping/access-groups/{id}", holding(auth.HousekeepingAccessGroups, r.HandleAccessGroupSave))
	mux.Handle("POST /housekeeping/access-groups/{id}/delete", holding(auth.HousekeepingAccessGroups, r.HandleAccessGroupDelete))
	mux.Handle("POST /housekeeping/users/{id}/access-groups", holding(auth.HousekeepingAccessGroups, r.HandleUsersAccessGroupsSave))

	mux.Handle("GET /housekeeping/logs", holding(auth.HousekeepingLogs, r.HandleLogsView))

	mux.Handle("GET /housekeeping/alerts", holding(auth.HousekeepingAlerts, r.HandleAlertsView))
	mux.Handle("POST /housekeeping/alerts", holding(auth.HousekeepingAlerts, r.HandleAlertsSend))

	mux.Handle("GET /housekeeping/bans", holding(auth.HousekeepingBans, r.HandleBansView))
	mux.Handle("POST /housekeeping/bans", holding(auth.HousekeepingBans, r.HandleBansCreate))
	mux.Handle("POST /housekeeping/bans/{id}/lift", holding(auth.HousekeepingBans, r.HandleBansLift))

	mux.Handle("GET /housekeeping/help", holding(auth.HousekeepingHelp, r.HandleHelpView))
	mux.Handle("GET /housekeeping/help/{id}", holding(auth.HousekeepingHelp, r.HandleHelpTicketView))
	mux.Handle("POST /housekeeping/help/{id}/pick", holding(auth.HousekeepingHelp, r.HandleHelpPick))
	mux.Handle("POST /housekeeping/help/{id}/close", holding(auth.HousekeepingHelp, r.HandleHelpClose))

	mux.Handle("GET /housekeeping/habbos", holding(auth.HousekeepingUsers, r.HandleHabbosView))
	mux.Handle("GET /housekeeping/habbos/{id}", holding(auth.HousekeepingUsers, r.HandleHabboView))
	mux.Handle("POST /housekeeping/habbos/{id}", holding(auth.HousekeepingUsersEdit, r.HandleHabboSave))
	mux.Handle("POST /housekeeping/habbos/{id}/badges", holding(auth.HousekeepingUsersEdit, r.HandleHabboBadgesGive))
	mux.Handle("POST /housekeeping/habbos/{id}/badges/{code}/delete", holding(auth.HousekeepingUsersEdit, r.HandleHabboBadgesDelete))
	mux.Handle("POST /housekeeping/habbos/{id}/restore", holding(auth.HousekeepingUsersEdit, r.HandleHabboRestore))
	mux.Handle("POST /housekeeping/habbos/{id}/credits", holding(auth.HousekeepingCredits, r.HandleHabboCreditsGive))
	mux.Handle("GET /housekeeping/habbos/{id}/transactions", holding(auth.HousekeepingCredits, r.HandleHabboTransactionsView))
	mux.Handle("POST /housekeeping/users/{id}", holding(auth.HousekeepingUsersEdit, r.HandleUserSave))
	mux.Handle("POST /housekeeping/users/{id}/attributes", holding(auth.HousekeepingAccessGroups, r.HandleUserAttributesSave))

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
