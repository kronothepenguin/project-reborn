// Package web is the HTTP server of reborn's runners, and the flow they share.
package web

import (
	"context"
	"errors"
	"fmt"
	"log"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"sync"
	"sync/atomic"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/installer"
	"github.com/kronothepenguin/project-reborn/packages/reborn"
)

// Server serves the handler the runner gave last, with one http.Server on
// host:port, and a second one on a new port while the first shuts down.
type Server struct {
	handler atomic.Pointer[http.Handler]

	// mu guards the fields below, which Move changes.
	mu   sync.Mutex
	host string
	port int
	srv  *http.Server
}

// Server moves the hotel for the installer.
var _ installer.Listener = (*Server)(nil)

// New returns the server of host:port. Serve opens it.
func New(host string, port int) *Server {
	return &Server{host: host, port: port}
}

// Serve serves h from now on, on every connection. The first call listens on
// host:port and starts the server.
func (s *Server) Serve(h http.Handler) error {
	s.handler.Store(&h)
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.srv != nil {
		return nil
	}
	addr := net.JoinHostPort(s.host, strconv.Itoa(s.port))
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("web: %w", err)
	}
	s.start(ln)
	slog.Info("reborn on http://" + addr)
	return nil
}

// Move serves the hotel on a new port: it starts a second server on
// host:port, redirects the browser to the same path there, and shuts the old
// server down after the response. On host 0.0.0.0 or ::, the browser keeps its
// host name. With the port the server holds, Move keeps the server and
// redirects to the same path; the new host applies at the next start. When the
// new address cannot be opened, Move leaves w untouched and returns the error.
func (s *Server) Move(w http.ResponseWriter, req *http.Request, host string, port int) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if port == s.port {
		http.Redirect(w, req, req.URL.Path, http.StatusSeeOther)
		return nil
	}
	addr := net.JoinHostPort(host, strconv.Itoa(port))
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("web: %w", err)
	}
	old := s.srv
	s.start(ln)
	s.host, s.port = host, port
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

// Shutdown shuts the running server down: the open requests finish, until ctx
// ends.
func (s *Server) Shutdown(ctx context.Context) error {
	s.mu.Lock()
	srv := s.srv
	s.mu.Unlock()
	if srv == nil {
		return nil
	}
	return srv.Shutdown(ctx)
}

// start serves ln with a new http.Server, as the running one. The caller
// holds mu.
func (s *Server) start(ln net.Listener) {
	srv := &http.Server{
		Handler: http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			(*s.handler.Load()).ServeHTTP(w, req)
		}),
		ReadHeaderTimeout: 10 * time.Second,
	}
	go func() {
		if err := srv.Serve(ln); !errors.Is(err, http.ErrServerClosed) {
			slog.Error("web: the server stopped", "err", err)
		}
	}()
	s.srv = srv
}

// Run serves the installer until the administrator exists, then the site and
// housekeeping with the game, until ctx ends: the open requests finish for up
// to ten seconds, and the game logs every player out.
func Run(ctx context.Context, s *Server, r *reborn.Reborn) {
	shutdown := func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := s.Shutdown(ctx); err != nil {
			slog.Error("reborn: " + err.Error())
		}
	}

	if !r.Installed() {
		mux := http.NewServeMux()
		r.MountInstaller(mux)
		if err := s.Serve(mux); err != nil {
			log.Fatalln(err)
		}
		slog.Info("reborn installs a new hotel under /installer/")
		if err := r.WaitForInstall(ctx); err != nil {
			shutdown()
			return // Ctrl-C before the installation ended
		}
	}

	mux := http.NewServeMux()
	r.Mount(mux)
	if err := s.Serve(mux); err != nil {
		log.Fatalln(err)
	}
	if err := r.Start(ctx); err != nil {
		log.Fatalln(err)
	}
	<-ctx.Done()
	shutdown()
	if err := r.Stop(context.Background()); err != nil {
		slog.Error(err.Error())
	}
}
