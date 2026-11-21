// Package web is the HTTP server of reborn's runners. It serves one handler at
// a time on one open listener, replaces the handler's server on that listener,
// and moves to a new address for the installer.
package web

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"maps"
	"net"
	"net/http"
	"net/url"
	"slices"
	"strconv"
	"sync"
	"syscall"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/installer"
)

// Server is the runner's HTTP server. The open listener hands each connection
// it accepts to the current http.Server, so that a new server takes the
// listener over without closing it.
type Server struct {
	// mu guards every field below.
	mu   sync.Mutex
	host string
	port int
	// ln is the open listener, nil before the first Serve and after
	// Shutdown; accepting is closed once its accept loop ends.
	ln        net.Listener
	accepting chan struct{}
	// current serves handler and takes every new connection; retired
	// servers finish their connections.
	current *server
	retired map[*server]struct{}
	handler http.Handler
}

// Server moves the hotel for the installer.
var _ installer.Listener = (*Server)(nil)

// New returns the server of host:port. Serve opens it.
func New(host string, port int) *Server {
	return &Server{host: host, port: port}
}

// Serve serves h. The first call opens the listener. A later call starts a
// server for h on the open listener first, then retires the old one: it
// takes no new connection, and closes each of its own after its next
// response, so no request finds the address closed.
func (s *Server) Serve(h http.Handler) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.ln == nil {
		addr := net.JoinHostPort(s.host, strconv.Itoa(s.port))
		ln, err := net.Listen("tcp", addr)
		if err != nil {
			return fmt.Errorf("web: %w", err)
		}
		s.listen(ln)
		slog.Info("reborn on http://" + addr)
	}
	s.replace(h)
	return nil
}

// Move serves the hotel on host:port, redirects the browser to the same path
// there, closes the old listener and retires the old server, as Serve does. On host 0.0.0.0 or ::, the browser keeps its host name. When the
// new address cannot be opened, Move leaves w untouched and returns the error.
func (s *Server) Move(w http.ResponseWriter, req *http.Request, host string, port int) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	addr := net.JoinHostPort(host, strconv.Itoa(port))
	ln, err := net.Listen("tcp", addr)
	if errors.Is(err, syscall.EADDRINUSE) && port == s.port {
		// The new address covers the old one, as 0.0.0.0 covers localhost
		// on the same port: the old listener lets go of the port first.
		ln, err = s.handOver(addr)
	}
	if err != nil {
		return fmt.Errorf("web: %w", err)
	}
	s.ln.Close()
	s.listen(ln)
	s.host, s.port = host, port
	s.replace(s.handler)
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

// Shutdown closes the listener and shuts every server down: the open requests
// finish, until ctx ends.
func (s *Server) Shutdown(ctx context.Context) error {
	s.mu.Lock()
	ln, servers := s.ln, slices.Collect(maps.Keys(s.retired))
	if s.current != nil {
		servers = append(servers, s.current)
	}
	s.ln, s.current, s.retired = nil, nil, nil
	s.mu.Unlock()
	if ln != nil {
		ln.Close()
	}
	var errs []error
	for _, srv := range servers {
		srv.conns.Close()
		errs = append(errs, srv.Shutdown(ctx))
	}
	return errors.Join(errs...)
}

// handOver closes the open listener and opens addr in its place. When addr
// cannot be opened, the old address is opened again. The caller holds mu.
func (s *Server) handOver(addr string) (net.Listener, error) {
	oldAddr := s.ln.Addr().String()
	s.ln.Close()
	<-s.accepting
	ln, err := net.Listen("tcp", addr)
	if err == nil {
		return ln, nil
	}
	back, backErr := net.Listen("tcp", oldAddr)
	if backErr != nil {
		slog.Error("web: the hotel cannot listen again on its old address", "addr", oldAddr, "err", backErr)
		return nil, err
	}
	s.listen(back)
	return nil, err
}

// listen makes ln the open listener, and accepts its connections for the
// current server. The caller holds mu.
func (s *Server) listen(ln net.Listener) {
	accepting := make(chan struct{})
	s.ln, s.accepting = ln, accepting
	go func() {
		defer close(accepting)
		s.accept(ln)
	}()
}

// replace starts a server for h, which takes every new connection, and
// retires the old one. The caller holds mu.
func (s *Server) replace(h http.Handler) {
	old := s.current
	srv := newServer(h, s.ln.Addr())
	s.current, s.handler = srv, h
	if old == nil {
		return
	}
	if s.retired == nil {
		s.retired = map[*server]struct{}{}
	}
	s.retired[old] = struct{}{}
	old.retire(func() {
		s.mu.Lock()
		delete(s.retired, old)
		s.mu.Unlock()
	})
}

// accept hands each connection of ln to the current server, until ln closes.
// A failed accept is retried after a pause, as http.Server does.
func (s *Server) accept(ln net.Listener) {
	var pause time.Duration
	for {
		c, err := ln.Accept()
		if errors.Is(err, net.ErrClosed) {
			return
		}
		if err != nil {
			pause = min(max(2*pause, 5*time.Millisecond), time.Second)
			slog.Error("web: accept", "err", err, "retry", pause)
			time.Sleep(pause)
			continue
		}
		pause = 0
		s.hand(c)
	}
}

// hand gives c to the current server. When that server shuts down before it
// takes c, the server that replaced it takes c; after Shutdown, c closes.
func (s *Server) hand(c net.Conn) {
	for {
		s.mu.Lock()
		srv := s.current
		s.mu.Unlock()
		if srv != nil && srv.push(c) {
			return
		}
		s.mu.Lock()
		replaced := s.current != srv && s.current != nil
		s.mu.Unlock()
		if !replaced {
			c.Close()
			return
		}
	}
}

// server is one http.Server, fed by the open listener while it is current.
type server struct {
	*http.Server
	conns *conns

	// mu guards open, retired and done.
	mu      sync.Mutex
	open    int
	retired bool
	done    func()
}

func newServer(h http.Handler, addr net.Addr) *server {
	srv := &server{conns: &conns{ch: make(chan net.Conn), closed: make(chan struct{}), addr: addr}}
	srv.Server = &http.Server{
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if srv.isRetired() {
				w.Header().Set("Connection", "close")
			}
			h.ServeHTTP(w, r)
		}),
		ConnState:         srv.track,
		ReadHeaderTimeout: 10 * time.Second,
		IdleTimeout:       2 * time.Minute,
	}
	go func() {
		err := srv.Serve(srv.conns)
		if !errors.Is(err, http.ErrServerClosed) && !errors.Is(err, net.ErrClosed) {
			slog.Error("web: the server stopped", "err", err)
		}
	}()
	return srv
}

func (srv *server) isRetired() bool {
	srv.mu.Lock()
	defer srv.mu.Unlock()
	return srv.retired
}

// retire stops the server's accepting. Each of its connections closes after
// its next response, or after a while idle; once none is left, the server
// closes and done runs.
func (srv *server) retire(done func()) {
	srv.conns.Close()
	srv.mu.Lock()
	srv.retired, srv.done = true, done
	last := srv.open == 0
	srv.mu.Unlock()
	if last {
		go srv.end()
	}
}

// push hands c to the server, and reports false when the server stopped
// accepting first. It counts c as open from before the hand-over, so that the
// server cannot close while c is on its way.
func (srv *server) push(c net.Conn) bool {
	srv.mu.Lock()
	srv.open++
	srv.mu.Unlock()
	if srv.conns.push(c) {
		return true
	}
	srv.track(c, http.StateClosed)
	return false
}

// track counts the server's open connections down as they close.
func (srv *server) track(_ net.Conn, state http.ConnState) {
	srv.mu.Lock()
	if state == http.StateClosed || state == http.StateHijacked {
		srv.open--
	}
	last := srv.retired && srv.open == 0
	srv.mu.Unlock()
	if last {
		go srv.end()
	}
}

func (srv *server) end() {
	srv.Close()
	srv.mu.Lock()
	done := srv.done
	srv.done = nil
	srv.mu.Unlock()
	if done != nil {
		done()
	}
}

// conns is the listener a server accepts from: the connections the open
// listener hands it.
type conns struct {
	ch     chan net.Conn
	once   sync.Once
	closed chan struct{}
	addr   net.Addr
}

func (q *conns) Accept() (net.Conn, error) {
	select {
	case c := <-q.ch:
		return c, nil
	case <-q.closed:
		return nil, net.ErrClosed
	}
}

// Close stops the server's accepting. It leaves the open listener alone.
func (q *conns) Close() error {
	q.once.Do(func() { close(q.closed) })
	return nil
}

func (q *conns) Addr() net.Addr { return q.addr }

// push hands c to the server, and reports false when the server stopped
// accepting first.
func (q *conns) push(c net.Conn) bool {
	select {
	case q.ch <- c:
		return true
	case <-q.closed:
		return false
	}
}
