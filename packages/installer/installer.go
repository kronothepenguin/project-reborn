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

// New continues the installation found in the working directory. With db, as
// reborn hands it, the installer works on db and creates no database. With
// nil, run alone, it opens the database an existing config.json names, or
// creates it in the config step.
func New(ctx context.Context, db *sql.DB, opts ...Option) (*Installer, error) {
	state, err := setup.Open(ctx, db)
	if err != nil {
		return nil, err
	}
	i := &Installer{setup: state}
	for _, opt := range opts {
		opt(i)
	}
	return i, nil
}

// Installed reports whether the administrator exists.
func (i *Installer) Installed() bool {
	select {
	case <-i.setup.Done():
		return true
	default:
		return false
	}
}

// WaitForInstall returns once the administrator exists, or with ctx's error
// when ctx ends first.
func (i *Installer) WaitForInstall(ctx context.Context) error {
	select {
	case <-i.setup.Done():
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
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
	route("GET /installer/settings", r.HandleSettingsView)
	route("POST /installer/settings", r.HandleSettingsSave)
	route("GET /installer/client", r.HandleClientView)
	route("POST /installer/client", r.HandleClientSave)
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

// Services are what reborn hands the installer. Run alone, the installer has none.
type Services struct {
	// Listener makes the config step ask one host and port for the whole hotel,
	// and moves the hotel there. Without it, the config step asks the database,
	// the site's port and housekeeping's port, for programs run apart.
	Listener Listener
}

// Inject hands the installer its services, once, after New and before Mount:
// Mount gives the router the services the installer holds then.
func (i *Installer) Inject(s Services) {
	i.listener = s.Listener
}
