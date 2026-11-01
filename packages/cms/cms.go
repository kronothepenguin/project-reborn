package cms

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/router"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/scheduler"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

//go:embed dist/*
var DistFS embed.FS

type CMS struct {
	db      *sql.DB
	static  http.Handler
	resolve astro.Resolver
	// protect wraps every CMS route with RealIP, cross-origin protection and
	// the session, so that the CMS stays protected on a mux it shares.
	protect func(http.Handler) http.Handler
}

type Option func(*CMS)

// New loads the settings from config.json and db, and panics when it cannot,
// like store.Must: the CMS cannot serve without them.
func New(db *sql.DB, opts ...Option) *CMS {
	cfg := config.Get()
	if err := settings.Load(context.Background(), cfg, db); err != nil {
		panic(fmt.Errorf("cms: %w", err))
	}
	realIP, err := auth.RealIP(cfg.Proxy)
	if err != nil {
		panic(fmt.Errorf("cms: %w", err))
	}
	crossOrigin := http.NewCrossOriginProtection()
	sessions := auth.Sessions(db)

	c := &CMS{
		db: db,
		protect: func(h http.Handler) http.Handler {
			return realIP(crossOrigin.Handler(sessions(h)))
		},
	}
	for _, opt := range opts {
		opt(c)
	}
	scheduler.Every(1, scheduler.Minute, func(ctx context.Context) error {
		return auth.DeleteExpiredResets(ctx, db)
	})
	scheduler.Every(1, scheduler.Minute, func(ctx context.Context) error {
		return auth.DeleteExpiredSessions(ctx, db)
	})
	return c
}

func (c *CMS) Mount(mux *http.ServeMux) {
	r := router.New(router.Deps{Resolver: c.resolve, DB: c.db, Queries: store.New(c.db)})
	page := func(h http.Handler) http.Handler { return c.protect(r.Banned(r.Maintenance(h))) }
	guestPage := func(h http.HandlerFunc) http.Handler { return page(router.Guest(h)) }

	mux.Handle("GET /{$}", guestPage(r.HandleIndexView))
	mux.Handle("GET /xml/promo-habbos.xml", page(http.HandlerFunc(r.HandleXMLPromoHabbos)))
	// Signing in and out stays open during maintenance, for staff.
	mux.Handle("POST /{$}", c.protect(router.Guest(http.HandlerFunc(r.HandleIndexLogin))))
	mux.Handle("POST /logout", c.protect(r.Banned(http.HandlerFunc(r.HandleLogout))))
	mux.Handle("GET /logout", page(http.HandlerFunc(r.HandleLogoutView)))

	mux.Handle("GET /me", page(auth.RequireSession(http.HandlerFunc(r.HandleMeView))))
	mux.Handle("POST /me/motto", page(auth.RequireSession(http.HandlerFunc(r.HandleMeMotto))))
	mux.Handle("POST /me/alerts/{id}/dismiss", page(auth.RequireSession(http.HandlerFunc(r.HandleMeAlertDismiss))))

	mux.Handle("GET /register", guestPage(r.HandleRegisterView))
	mux.Handle("POST /register", guestPage(r.HandleRegister))
	mux.Handle("POST /register/check-name", page(http.HandlerFunc(r.HandleRegisterCheckName)))

	mux.Handle("GET /forgot", page(http.HandlerFunc(r.HandleForgotView)))
	mux.Handle("POST /forgot", page(http.HandlerFunc(r.HandleForgot)))
	mux.Handle("GET /reset/{token}", guestPage(r.HandleResetView))
	mux.Handle("POST /reset/{token}", guestPage(r.HandleReset))

	mux.Handle("GET /disclaimer", page(http.HandlerFunc(r.HandleDisclaimerView)))
	mux.Handle("GET /privacy", page(http.HandlerFunc(r.HandlePrivacyView)))

	mux.Handle("/", c.static)
}

func WithStatic(h http.Handler) Option {
	return func(c *CMS) {
		c.static = h
	}
}

func WithResolver(r astro.Resolver) Option {
	return func(c *CMS) {
		c.resolve = r
	}
}
