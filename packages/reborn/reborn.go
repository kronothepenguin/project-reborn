// Package reborn builds the whole hotel on one database handle: the site,
// housekeeping, the installer and the game. It mounts the installer, or the
// site and housekeeping, on a mux it receives, and starts and stops the game.
// Its runner owns the HTTP server.
package reborn

import (
	"context"
	"database/sql"
	"embed"
	"html/template"
	"log/slog"
	"net/http"
	"path"
	"path/filepath"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/installer"
	"github.com/kronothepenguin/project-reborn/packages/server"
)

// DistFS holds what reborn's Astro project builds: the pages and files of the
// site at the root, of housekeeping under housekeeping/ and of the installer
// under installer/.
//
//go:embed dist/*
var DistFS embed.FS

// Reborn holds the programs it built on the runner's database.
type Reborn struct {
	resolve astro.Resolver
	static  http.Handler

	cms          *cms.CMS
	housekeeping *housekeeping.Housekeeping
	installer    *installer.Installer
	game         *server.Server
}

type Option func(*Reborn)

// WithResolver gives reborn the pages of its dist, or of its dev server. Each
// site resolves its pages under its base: housekeeping's index.html is
// housekeeping/index.html.
func WithResolver(r astro.Resolver) Option {
	return func(rb *Reborn) { rb.resolve = r }
}

// WithStatic gives reborn the files of its dist, or of its dev server. Each
// site serves its files under its base: housekeeping's /favicon.svg is
// /housekeeping/favicon.svg.
func WithStatic(h http.Handler) Option {
	return func(rb *Reborn) { rb.static = h }
}

// New builds the site, housekeeping, the installer and the game on db, injects
// the game into the two sites and mover into the installer. It returns the
// installer's error when the installation found in the working directory
// cannot be read.
func New(db *sql.DB, mover installer.Listener, opts ...Option) (*Reborn, error) {
	r := &Reborn{}
	for _, opt := range opts {
		opt(r)
	}

	// The CMS is built first, so its automatic updates run before the game
	// reads the database.
	r.cms = cms.New(db, cms.WithResolver(r.resolve), cms.WithStatic(r.static))
	r.housekeeping = housekeeping.New(db,
		housekeeping.WithResolver(under(r.resolve, "housekeeping")),
		housekeeping.WithStatic(prefixed(r.static, "/housekeeping")))
	i, err := installer.New(context.Background(), db,
		installer.WithResolver(under(r.resolve, "installer")),
		installer.WithStatic(prefixed(r.static, "/installer")))
	if err != nil {
		return nil, err
	}
	r.installer = i
	r.game = server.New(db)

	r.cms.Inject(cms.Services{Habbos: r.game, Hotel: r.game, Economy: r.game})
	r.housekeeping.Inject(housekeeping.Services{Habbos: r.game, Hotel: r.game, Economy: r.game})
	r.installer.Inject(installer.Services{Listener: mover})
	return r, nil
}

// Installed reports whether the administrator exists.
func (r *Reborn) Installed() bool {
	return r.installer.Installed()
}

// WaitForInstall returns once the administrator exists, or with ctx's error
// when ctx ends first.
func (r *Reborn) WaitForInstall(ctx context.Context) error {
	if err := r.installer.WaitForInstall(ctx); err != nil {
		return err
	}
	slog.Info("reborn: the hotel is installed", "config", absolute(config.Filename), "database", absolute(config.Get().Store.Path))
	return nil
}

// MountInstaller registers the installer, and sends every other page to
// /installer/. A request that falls to the static files of the site or of
// housekeeping is served: the files of reborn's dist, and the dev server's
// own paths such as /@vite/client. Once the administrator exists, every page
// outside /installer/ is the site's, so the browser's request for / right
// after "Create administrator" finds the site before the runner replaces the
// mux.
func (r *Reborn) MountInstaller(mux *http.ServeMux) {
	site := http.NewServeMux()
	r.Mount(site)
	r.installer.Mount(mux)
	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if r.Installed() || isStatic(site, req) {
			site.ServeHTTP(w, req)
			return
		}
		http.Redirect(w, req, "/installer/", http.StatusSeeOther)
	}))
}

// Mount registers the site and housekeeping. /installer and every path under
// it answer 404, so that the installer's built pages stay out of reach.
func (r *Reborn) Mount(mux *http.ServeMux) {
	r.cms.Mount(mux)
	r.housekeeping.Mount(mux)
	mux.HandleFunc("/installer", http.NotFound)
	mux.HandleFunc("/installer/", http.NotFound)
}

// Start opens the game's doors. It returns the game's error.
func (r *Reborn) Start(ctx context.Context) error {
	return r.game.Start(ctx)
}

// Stop logs each player out, with its last time online saved, and closes the
// game's doors. It returns ctx's cause when ctx ends first.
func (r *Reborn) Stop(ctx context.Context) error {
	return r.game.Stop(ctx)
}

// isStatic tells whether req falls to the static files of the site, at /, or
// of housekeeping, at /housekeeping/.
func isStatic(site *http.ServeMux, req *http.Request) bool {
	_, pattern := site.Handler(req)
	return pattern == "/" || pattern == "/housekeeping/"
}

// under resolves a site's pages in the folder of its base.
func under(resolve astro.Resolver, base string) astro.Resolver {
	return func(name string) (*template.Template, error) {
		return resolve(path.Join(base, name))
	}
}

// prefixed serves a site's files under its base. A site strips its base
// before its static handler, and prefixed puts it back.
func prefixed(static http.Handler, base string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		r := req.Clone(req.Context())
		r.URL.Path = base + req.URL.Path
		if req.URL.RawPath != "" {
			r.URL.RawPath = base + req.URL.RawPath
		}
		static.ServeHTTP(w, r)
	})
}

func absolute(name string) string {
	if abs, err := filepath.Abs(name); err == nil {
		return abs
	}
	return name
}
