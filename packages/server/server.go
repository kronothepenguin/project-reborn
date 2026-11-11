package server

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"strconv"
	"sync/atomic"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/scheduler"
	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/router"
	"github.com/kronothepenguin/project-reborn/packages/server/r26"
	"github.com/kronothepenguin/project-reborn/packages/server/transport"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/catalogue"
	"github.com/kronothepenguin/project-reborn/packages/virtual/category"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
	"github.com/kronothepenguin/project-reborn/packages/virtual/model"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type Server struct {
	db *sql.DB
}

// New loads the settings from config.json and db, and panics when it cannot, like cms.New: the handshake and the login
// read them. Housekeeping is their only writer, so the server reloads them every cms.refresh seconds while no update
// waits, as the CMS does (plans/server decision 0050). It loads what every player shares too, the navigator and the
// catalogue, at once or, while updates wait, with the first reload after they are applied (plans/server decisions 0064
// and 0098).
func New(db *sql.DB) *Server {
	list, err := store.Updates()
	if err != nil {
		panic(fmt.Errorf("server: %w", err))
	}
	ctx := context.Background()
	if err := settings.Load(ctx, config.Get(), db); err != nil {
		panic(fmt.Errorf("server: %w", err))
	}
	updates := store.NewUpdateCheck(db, list)
	var shared atomic.Bool
	loaded, err := loadShared(ctx, db, updates)
	if err != nil {
		panic(fmt.Errorf("server: %w", err))
	}
	if !loaded {
		slog.Warn("server: the navigator and the catalogue wait for the database updates")
	}
	shared.Store(loaded)
	scheduler.Every(settings.GetInt("cms.refresh"), scheduler.Second, updates.WhenCurrent(func(ctx context.Context) error {
		if !shared.Load() {
			loaded, err := loadShared(ctx, db, updates)
			if err != nil {
				return err
			}
			if loaded {
				slog.Info("server: the navigator and the catalogue are loaded")
			}
			shared.Store(loaded)
		}
		return settings.Reload(ctx, db)
	}))
	// The game server saves the chat, so it prunes it: now, then every hour (plans/server decision 0084).
	prune := updates.WhenCurrent(func(ctx context.Context) error { return game.PruneChat(ctx, db, time.Now()) })
	if err := prune(ctx); err != nil {
		slog.Error(err.Error())
	}
	scheduler.Every(1, scheduler.Hour, prune)
	return &Server{db: db}
}

// loadShared loads what every player shares once no update waits, and reports whether it did: the navigator's
// categories, models and public rooms, and the furni definitions and the catalogue that reads them. They come with
// updates an administrator applies (plans/server decisions 0064 and 0098).
func loadShared(ctx context.Context, db *sql.DB, updates *store.UpdateCheck) (bool, error) {
	waiting, err := updates.Waiting(ctx)
	if err != nil || waiting {
		return false, err
	}
	for _, load := range []func(context.Context, *sql.DB) error{category.Load, model.Load, room.Load, furni.Load, catalogue.Load} {
		if err := load(ctx, db); err != nil {
			return false, err
		}
	}
	return true, nil
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
	return listen("info", cfg.Server.Info.Host, cfg.Server.Info.Port, func(conn transport.Conn) { r26.Serve(c.db, conn) })
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
