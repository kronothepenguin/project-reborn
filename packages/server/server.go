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
	"github.com/kronothepenguin/project-reborn/packages/server/internal/game"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/r26"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/router"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/transport"
	"github.com/kronothepenguin/project-reborn/packages/services"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/catalogue"
	"github.com/kronothepenguin/project-reborn/packages/virtual/category"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
	"github.com/kronothepenguin/project-reborn/packages/virtual/model"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type Server struct {
	db  *sql.DB
	api bool
}

type Option func(*Server)

// WithAPI opens the game's /api/ on server.api in config.json, for the programs run apart from the game, which call it
// with the hotel's secret (decision reborn/0005). reborn leaves it out: there the site calls the game in its process.
func WithAPI() Option {
	return func(s *Server) { s.api = true }
}

// Server is the game that the Habbos service tells of a habbo changed outside it.
var _ services.Habbos = (*Server)(nil)

// New loads the settings from config.json and db, and panics when it cannot, like cms.New: the handshake and the login
// read them. Housekeeping is their only writer, so the server reloads them every cms.refresh seconds while no update
// waits, as the CMS does (decision server/0050). It loads what every player shares too, the navigator and the
// catalogue, at once or, while updates wait, with the first reload after they are applied (decisions server/0064
// and server/0098). With WithAPI it opens the /api/ listener too, and panics when it cannot listen.
func New(db *sql.DB, opts ...Option) *Server {
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
	// The game server saves the chat, so it prunes it: now, then every hour (decision server/0084).
	prune := updates.WhenCurrent(func(ctx context.Context) error { return game.PruneChat(ctx, db, time.Now()) })
	if err := prune(ctx); err != nil {
		slog.Error(err.Error())
	}
	scheduler.Every(1, scheduler.Hour, prune)
	// Room bans end, and the game server, which writes them, deletes the ended ones every minute, as expired
	// sessions go.
	scheduler.Every(1, scheduler.Minute, updates.WhenCurrent(func(ctx context.Context) error {
		return game.DeleteEndedRoomBans(ctx, db, time.Now())
	}))
	s := &Server{db: db}
	for _, opt := range opts {
		opt(s)
	}
	if s.api {
		if err := s.listenAPI(); err != nil {
			panic(err)
		}
	}
	return s
}

// listenAPI serves the game's /api/ on the host and port of server.api in config.json, in the background. Every
// request without the hotel's secret, and every path but the API's, is answered 404.
func (c *Server) listenAPI() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	r := router.New(router.Deps{DB: c.db, Habbos: c})
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/habbos/{id}/look", r.HandleHabbosLook)
	mux.HandleFunc("/", http.NotFound)

	addr := net.JoinHostPort(cfg.Server.API.Host, strconv.Itoa(cfg.Server.API.Port))
	l, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("server: api: %w", err)
	}
	slog.Info("server: api on http://" + addr)
	srv := &http.Server{Handler: r.Secret(mux), ReadHeaderTimeout: 5 * time.Second}
	go func() {
		err := srv.Serve(l)
		slog.Error("server: api stopped", "err", err)
	}()
	return nil
}

// loadShared loads what every player shares once no update waits, and reports whether it did: the navigator's
// categories, models and public rooms, and the furni definitions and the catalogue that reads them. They come with
// updates an administrator applies (decisions server/0064 and server/0098).
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

// SendLook reads the habbo avatarID again and, while it is online, shows its saved figure, gender and motto to it and
// to the room it is in (decision reborn/0013). An offline habbo gets nothing.
func (c *Server) SendLook(ctx context.Context, avatarID int64) error {
	return game.SendLook(ctx, c.db, avatarID)
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
