package installer

import (
	"context"
	"embed"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/router"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
)

//go:embed dist/*
var DistFS embed.FS

type Installer struct {
	static  http.Handler
	resolve astro.Resolver
	setup   *setup.State
}

type Option func(*Installer)

// New continues the installation found in the working directory: when
// config.json is there, it opens the database the file names.
func New(ctx context.Context, opts ...Option) (*Installer, error) {
	state, err := setup.Open(ctx)
	if err != nil {
		return nil, err
	}
	i := &Installer{setup: state}
	for _, opt := range opts {
		opt(i)
	}
	return i, nil
}

func (i *Installer) Mount(mux *http.ServeMux) {
	r := router.New(router.Deps{Resolver: i.resolve, Setup: i.setup})

	mux.HandleFunc("GET /{$}", r.HandleIndexView)
	mux.HandleFunc("GET /config", r.HandleConfigView)
	mux.HandleFunc("POST /config", r.HandleConfigWrite)
	mux.HandleFunc("GET /site", r.HandleSiteView)
	mux.HandleFunc("POST /site", r.HandleSiteSave)
	mux.HandleFunc("GET /admin", r.HandleAdminView)
	mux.HandleFunc("POST /admin", r.HandleAdminCreate)
	mux.HandleFunc("GET /done", r.HandleDoneView)

	mux.Handle("/", i.static)
}

func WithStatic(h http.Handler) Option {
	return func(i *Installer) {
		i.static = h
	}
}

func WithResolver(r astro.Resolver) Option {
	return func(i *Installer) {
		i.resolve = r
	}
}
