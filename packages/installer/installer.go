package installer

import (
	"context"
	"database/sql"
	"embed"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/router"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
)

//go:embed dist/*
var DistFS embed.FS

type Installer struct {
	static   http.Handler
	resolve  astro.Resolver
	listener Listener
	setup    *setup.State
}

type Option func(*Installer)

// Listener moves the running hotel to a new address: it opens host:port, redirects
// the browser to the same path there, and closes the old server right after.
// When it fails, it leaves w untouched and returns the error.
type Listener interface {
	Move(w http.ResponseWriter, r *http.Request, host string, port int) error
}

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

// Installed reports whether db has an administrator: someone holds
// housekeeping.accessGroups.
func Installed(ctx context.Context, db *sql.DB) (bool, error) {
	return setup.Installed(ctx, db)
}

// Done is closed once the administrator exists.
func (i *Installer) Done() <-chan struct{} {
	return i.setup.Done()
}

// Mount registers only /installer/..., so that the installer can share a mux
// with the site. Every route is behind cross-origin protection, since a shared
// mux is not wrapped by its runner.
func (i *Installer) Mount(mux *http.ServeMux) {
	deps := router.Deps{Resolver: i.resolve, Setup: i.setup}
	if i.listener != nil {
		deps.Move = i.listener.Move
	}
	r := router.New(deps)
	protect := http.NewCrossOriginProtection().Handler
	route := func(pattern string, handle http.HandlerFunc) {
		mux.Handle(pattern, protect(handle))
	}

	route("GET /installer/{$}", r.HandleIndexView)
	route("GET /installer/config", r.HandleConfigView)
	route("POST /installer/config", r.HandleConfigSave)
	route("GET /installer/site", r.HandleSiteView)
	route("POST /installer/site", r.HandleSiteSave)
	route("GET /installer/admin", r.HandleAdminView)
	route("POST /installer/admin", r.HandleAdminCreate)

	mux.Handle("/installer/", protect(http.StripPrefix("/installer", i.static)))
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

// WithListener asks one host and port for the whole hotel in the config step,
// and moves the hotel there through l. Without it, the config step asks the
// site's port and housekeeping's port, for programs run apart.
func WithListener(l Listener) Option {
	return func(i *Installer) {
		i.listener = l
	}
}
