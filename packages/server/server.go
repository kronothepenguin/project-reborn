package server

import (
	"database/sql"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/router"
	"github.com/kronothepenguin/project-reborn/packages/server/r26"
	"github.com/kronothepenguin/project-reborn/packages/server/transport"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

type Server struct {
	db *sql.DB
}

func New(db *sql.DB) *Server {
	return &Server{db: db}
}

func (c *Server) Mount(mux *http.ServeMux) {
	r := router.New(router.Deps{DB: c.db, Queries: store.New(c.db)})

	mux.HandleFunc("GET /{$}", r.HandleIndexView)
}

// StartInfo opens the WebSocket listener of the client's info connection on the host and port of server.info in
// config.json, and serves R26 on it in the background. It returns an error when it cannot listen.
func (c *Server) StartInfo() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	return listen("info", cfg.Server.Info.Host, cfg.Server.Info.Port, r26.Serve)
}

// StartMus opens the WebSocket listener of the client's mus connection on the host and port of server.mus in
// config.json, and serves it in the background. It returns an error when it cannot listen.
func (c *Server) StartMus() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	return listen("mus", cfg.Server.MUS.Host, cfg.Server.MUS.Port, serveMus)
}

// listen serves each connection of a WebSocket listener of its own with h, in a goroutine per connection, until the
// process ends.
func listen(name, host string, port int, h transport.Handler) error {
	addr := net.JoinHostPort(host, strconv.Itoa(port))
	l, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("server: %s: %w", name, err)
	}
	slog.Info("server: " + name + " on ws://" + addr)
	go func() {
		err := http.Serve(l, transport.WebSocket(h))
		slog.Error("server: "+name+" stopped", "err", err)
	}()
	return nil
}
