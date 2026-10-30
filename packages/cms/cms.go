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
	return c
}

func (c *CMS) Mount(mux *http.ServeMux) {
	r := router.New(router.Deps{Resolver: c.resolve, DB: c.db, Queries: store.New(c.db)})

	mux.Handle("GET /{$}", c.protect(r.Maintenance(r.HandleIndexView)))
	// The login form stays open during maintenance, so staff can sign in.
	mux.Handle("POST /{$}", c.protect(http.HandlerFunc(r.HandleIndexLogin)))

	mux.Handle("GET /register", c.protect(r.Maintenance(r.HandleRegisterView)))
	mux.Handle("POST /register", c.protect(r.Maintenance(r.HandleRegister)))

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
