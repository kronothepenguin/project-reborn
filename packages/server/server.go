package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/scheduler"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/game"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/r26"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/router"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/transport"
	"github.com/kronothepenguin/project-reborn/packages/services"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// noticeHold is how long each connection of info stays open after the notice of a hotel closed, so that the client,
// which draws it only while its connection is open, shows it. The tests shorten it.
var noticeHold = 5 * time.Second

type Server struct {
	db      *sql.DB
	updates *store.UpdateCheck
	api     bool

	// mu guards doors, which is nil while the doors are closed.
	mu    sync.Mutex
	doors *doors
}

type Option func(*Server)

// WithAPI opens the game's /api/ on server.api in config.json, for the programs run apart from the game, which call it
// with the hotel's secret (decision reborn/0005). reborn leaves it out: there the site calls the game in its process.
func WithAPI() Option {
	return func(s *Server) { s.api = true }
}

// Server is the game that the Habbos service tells of a habbo changed outside it and asks who is in the hotel, and the
// Hotel whose doors programs open and close.
var (
	_ services.Habbos = (*Server)(nil)
	_ services.Hotel  = (*Server)(nil)
)

// New loads what every player shares, the navigator and the catalogue, when no database update waits; otherwise the
// first login, or the first request for the navigator or the catalogue, after none waits loads them (decisions
// reborn/0006, server/0064 and server/0098). The server reads each setting from the store when it uses it, and never
// stops for waiting updates. New panics when the database fails. With WithAPI it opens the /api/ listener too, and
// panics when it cannot listen.
func New(db *sql.DB, opts ...Option) *Server {
	list, err := store.Updates()
	if err != nil {
		panic(fmt.Errorf("server: %w", err))
	}
	ctx := context.Background()
	updates := store.NewUpdateCheck(db, list)
	loaded, err := game.LoadShared(ctx, db, updates)
	if err != nil {
		panic(fmt.Errorf("server: %w", err))
	}
	if !loaded {
		slog.Warn("server: the navigator and the catalogue wait for the database updates")
	}
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
	s := &Server{db: db, updates: updates}
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
	r := router.New(router.Deps{DB: c.db, Habbos: c, Hotel: c})
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/hotel", r.HandleHotelView)
	mux.HandleFunc("POST /api/hotel/start", r.HandleHotelStart)
	mux.HandleFunc("POST /api/hotel/stop", r.HandleHotelStop)
	mux.HandleFunc("GET /api/habbos/online", r.HandleHabbosOnlineView)
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

// SendLook reads the habbo avatarID again and, while it is online, shows its saved figure, gender and motto to it and
// to the room it is in (decision reborn/0013). An offline habbo gets nothing.
func (c *Server) SendLook(ctx context.Context, avatarID int64) error {
	return game.SendLook(ctx, c.db, avatarID)
}

// Start opens the doors: the WebSocket listeners of the client's info and mus connections, on the hosts and ports of
// server.info and server.mus in config.json, which serve in the background. While game.closed or site.maintenance is
// on, the doors stay closed and Start returns nil. With the doors open already, Start does nothing. It returns an error
// when it cannot listen.
func (c *Server) Start(ctx context.Context) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.doors != nil {
		return nil
	}
	q := store.New(c.db)
	if settings.Bool(ctx, q, "game.closed") || settings.Bool(ctx, q, "site.maintenance") {
		slog.Info("server: the hotel is closed, and its doors stay closed")
		return nil
	}
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	closing, closeSessions := context.WithCancel(context.Background())
	d := &doors{closeSessions: closeSessions}
	err = d.listen("info", cfg.Server.Info.Host, cfg.Server.Info.Port, func(conn transport.Conn) { r26.Serve(closing, noticeHold, c.db, c.updates, conn) })
	if err == nil {
		err = d.listen("mus", cfg.Server.MUS.Host, cfg.Server.MUS.Port, func(conn transport.Conn) { serveMus(closing, conn) })
	}
	if err != nil {
		d.close()
		return err
	}
	c.doors = d
	return nil
}

// Stop closes the doors: the listeners close, each client of the info connection sees the client's notice of a hotel
// closed, and its habbo is logged out at once with its last time online saved. Each info connection closes 5 seconds
// after its notice, all of them together, and each mus connection at once, so Stop takes about 5 seconds while anybody
// is connected. Stop waits for the sessions to end until ctx ends, and then returns ctx's cause. With the doors closed
// already, Stop does nothing.
func (c *Server) Stop(ctx context.Context) error {
	c.mu.Lock()
	d := c.doors
	c.doors = nil
	if d != nil {
		d.close()
	}
	c.mu.Unlock()
	if d == nil {
		return nil
	}
	ended := make(chan struct{})
	go func() {
		d.sessions.Wait()
		close(ended)
	}()
	select {
	case <-ended:
		slog.Info("server: the doors are closed")
		return nil
	case <-ctx.Done():
		return fmt.Errorf("server: stop: %w", context.Cause(ctx))
	}
}

// Status tells whether the doors are open and how many habbos are in the hotel.
func (c *Server) Status(context.Context) (services.HotelStatus, error) {
	c.mu.Lock()
	running := c.doors != nil
	c.mu.Unlock()
	return services.HotelStatus{Running: running, Online: habbo.Count()}, nil
}

// AreOnline reports, for each of ids, whether that habbo is in the hotel now.
func (c *Server) AreOnline(_ context.Context, ids []int64) (map[int64]bool, error) {
	online := make(map[int64]bool, len(ids))
	for _, id := range ids {
		_, online[id] = habbo.Get(id)
	}
	return online, nil
}

// Online lists the avatar ids of the habbos in the hotel now, in ascending order.
func (c *Server) Online(context.Context) ([]int64, error) {
	return habbo.IDs(), nil
}

// doors are the listeners of the info and mus connections while the hotel is open, and the sessions they serve.
type doors struct {
	listeners []*http.Server
	// closeSessions ends the context every session watches, which closes it.
	closeSessions context.CancelFunc
	// mu guards closed, so that no session joins sessions once Stop waits for them.
	mu       sync.Mutex
	closed   bool
	sessions sync.WaitGroup
}

// listen serves each connection of a WebSocket listener of its own with h, in a goroutine per connection, until the
// doors close.
func (d *doors) listen(name, host string, port int, h transport.Handler) error {
	addr := net.JoinHostPort(host, strconv.Itoa(port))
	l, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("server: %s: %w", name, err)
	}
	slog.Info("server: " + name + " on ws://" + addr)
	srv := &http.Server{Handler: transport.WebSocket(func(conn transport.Conn) {
		d.mu.Lock()
		if d.closed {
			d.mu.Unlock()
			return
		}
		d.sessions.Add(1)
		d.mu.Unlock()
		defer d.sessions.Done()
		h(conn)
	})}
	d.listeners = append(d.listeners, srv)
	go func() {
		if err := srv.Serve(l); !errors.Is(err, http.ErrServerClosed) {
			slog.Error("server: "+name+" stopped", "err", err)
		}
	}()
	return nil
}

// close closes the listeners, and then every session they serve.
func (d *doors) close() {
	for _, srv := range d.listeners {
		srv.Close()
	}
	d.mu.Lock()
	d.closed = true
	d.mu.Unlock()
	d.closeSessions()
}
