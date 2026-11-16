// Package reborn runs the whole hotel in one process: the site and
// housekeeping on one mux, and the game server's two listeners, on one
// database handle. A hotel that is not installed gets the installer first.
package reborn

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"

	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/installer"
	"github.com/kronothepenguin/project-reborn/packages/server"
)

// Reborn holds the programs its runner builds, on the database the runner
// opened.
type Reborn struct {
	cfg          *config.Config
	db           *sql.DB
	cms          *cms.CMS
	housekeeping *housekeeping.Housekeeping
	installer    *installer.Installer
	game         *server.Server

	handler http.Handler
	// failed receives the first error of a listener, and ends Run.
	failed chan error

	// mu guards the HTTP server and the address it listens on, which Move
	// changes.
	mu       sync.Mutex
	srv      *http.Server
	listener *listener
	port     int
}

// Reborn moves the hotel for the installer.
var _ installer.Listener = (*Reborn)(nil)

func New(cfg *config.Config, db *sql.DB, c *cms.CMS, h *housekeeping.Housekeeping, i *installer.Installer, g *server.Server) *Reborn {
	return &Reborn{cfg: cfg, db: db, cms: c, housekeeping: h, installer: i, game: g, failed: make(chan error, 1)}
}

// Run serves the hotel until ctx ends: the CMS at / and housekeeping at
// /housekeeping/ on the address of the reborn section, and the game on
// server.info and server.mus. A hotel that is not installed gets the installer
// at /installer/ first, every route of the programs redirects there while
// files are served, and the game waits until the administrator exists.
func (r *Reborn) Run(ctx context.Context) error {
	installed, err := installer.Installed(ctx, r.db)
	if err != nil {
		return fmt.Errorf("reborn: %w", err)
	}

	mux := http.NewServeMux()
	r.cms.Mount(mux)
	r.housekeeping.Mount(mux)
	if installed {
		if err := r.startGame(); err != nil {
			return err
		}
	} else {
		r.installer.Mount(mux)
		go r.waitForInstall(ctx)
	}
	r.handler = r.guard(mux)

	addr := net.JoinHostPort(r.cfg.Reborn.Host, strconv.Itoa(r.cfg.Reborn.Port))
	l, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("reborn: %w", err)
	}
	r.mu.Lock()
	r.serve(l, r.cfg.Reborn.Port)
	r.mu.Unlock()
	if installed {
		slog.Info("reborn on http://" + addr)
	} else {
		slog.Info("reborn installs a new hotel on http://" + addr + "/installer/")
	}

	select {
	case err := <-r.failed:
		return fmt.Errorf("reborn: %w", err)
	case <-ctx.Done():
		r.mu.Lock()
		srv := r.srv
		r.mu.Unlock()
		return srv.Shutdown(context.WithoutCancel(ctx))
	}
}

// guard keeps visitors on the installer until the administrator exists, and
// off it from then on. Before the administrator exists, a route a program
// registered on mux redirects to the installer, and a request that falls to a
// static handler is served: the files of the sites, and the dev server's own
// paths under the dev runner.
func (r *Reborn) guard(mux *http.ServeMux) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		inInstaller := req.URL.Path == "/installer" || strings.HasPrefix(req.URL.Path, "/installer/")
		installed := isClosed(r.installer.Done())
		switch {
		case installed && inInstaller:
			http.NotFound(w, req)
		case !installed && !inInstaller && !isStatic(mux, req):
			http.Redirect(w, req, "/installer/", http.StatusSeeOther)
		default:
			mux.ServeHTTP(w, req)
		}
	})
}

// isStatic tells whether req falls to the static handler of the site, at /, or
// of housekeeping, at /housekeeping/.
func isStatic(mux *http.ServeMux, req *http.Request) bool {
	_, pattern := mux.Handler(req)
	return pattern == "/" || pattern == "/housekeeping/"
}

// waitForInstall starts the game once the administrator exists.
func (r *Reborn) waitForInstall(ctx context.Context) {
	select {
	case <-ctx.Done():
		return
	case <-r.installer.Done():
	}
	if err := r.startGame(); err != nil {
		r.fail(err)
		return
	}
	slog.Info("reborn: the hotel is installed", "config", absolute(config.Filename), "database", absolute(r.cfg.Store.Path))
}

func (r *Reborn) startGame() error {
	if err := r.game.StartInfo(); err != nil {
		return err
	}
	return r.game.StartMus()
}

// Move serves the hotel on host:port, redirects the browser to the same path
// there, and shuts the old server down right after the response. On host
// 0.0.0.0 or ::, the browser keeps its host name. When the new address cannot
// be opened, Move leaves w untouched and returns the error.
func (r *Reborn) Move(w http.ResponseWriter, req *http.Request, host string, port int) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	old := r.srv
	addr := net.JoinHostPort(host, strconv.Itoa(port))
	l, err := net.Listen("tcp", addr)
	if errors.Is(err, syscall.EADDRINUSE) && port == r.port {
		// The new address covers the old one, as 0.0.0.0 covers localhost
		// on the same port: the old server lets go of the port first.
		l, err = r.handOver(addr)
	}
	if err != nil {
		return fmt.Errorf("reborn: %w", err)
	}
	r.serve(l, port)
	go old.Shutdown(context.Background())
	slog.Info("reborn moves to http://" + addr)

	browserHost := host
	if ip := net.ParseIP(host); ip != nil && ip.IsUnspecified() {
		browserHost = req.Host
		if h, _, err := net.SplitHostPort(req.Host); err == nil {
			browserHost = h
		}
	}
	to := url.URL{Scheme: "http", Host: net.JoinHostPort(browserHost, strconv.Itoa(port)), Path: req.URL.Path}
	http.Redirect(w, req, to.String(), http.StatusSeeOther)
	return nil
}

// handOver shuts the old server down and opens addr in its place. When addr
// cannot be opened, the old address is served again.
func (r *Reborn) handOver(addr string) (net.Listener, error) {
	old, oldAddr := r.srv, r.listener.Addr().String()
	go old.Shutdown(context.Background())
	<-r.listener.closed
	l, err := net.Listen("tcp", addr)
	if err == nil {
		return l, nil
	}
	back, backErr := net.Listen("tcp", oldAddr)
	if backErr != nil {
		r.fail(backErr)
		return nil, err
	}
	r.serve(back, r.port)
	return nil, err
}

// serve serves the hotel on l, as the current server. The caller holds mu.
func (r *Reborn) serve(l net.Listener, port int) {
	ln := &listener{Listener: l, closed: make(chan struct{})}
	srv := &http.Server{Handler: r.handler}
	go func() {
		if err := srv.Serve(ln); !errors.Is(err, http.ErrServerClosed) {
			r.fail(err)
		}
	}()
	r.srv, r.listener, r.port = srv, ln, port
}

func (r *Reborn) fail(err error) {
	select {
	case r.failed <- err:
	default:
	}
}

// listener tells when the server has closed it, so that another can take its
// port.
type listener struct {
	net.Listener
	once   sync.Once
	closed chan struct{}
}

func (l *listener) Close() error {
	err := l.Listener.Close()
	l.once.Do(func() { close(l.closed) })
	return err
}

func isClosed(c <-chan struct{}) bool {
	select {
	case <-c:
		return true
	default:
		return false
	}
}

func absolute(path string) string {
	if abs, err := filepath.Abs(path); err == nil {
		return abs
	}
	return path
}
