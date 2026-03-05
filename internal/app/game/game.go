package game

import (
	"log/slog"
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/app/game/protocol"
	hhentryinit "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_entry_init"
	"github.com/kronothepenguin/project-reborn/internal/app/game/transport"
	"github.com/kronothepenguin/project-reborn/internal/pkg/virtual"
)

type Game struct {
	loginRegistry protocol.Registry
	gameRegistry  protocol.Registry

	hotel *virtual.Hotel
}

func New() *Game {
	return &Game{
		loginRegistry: createLoginRegistry(),
		gameRegistry:  createGameRegistry(),
	}
}

func (g *Game) handleInfo(conn transport.Connection) {
	defer conn.Close()

	for {
		p, err := protocol.ReadPacket(conn, nil)
		if err != nil {
			break
		}

		slog.Default().Info("<<", slog.Int("cmd", int(p.Command)), slog.String("msg", p.Message.String()))
	}
}

func (g *Game) Mount(mux *http.ServeMux) {
	ws := transport.NewWebSocket()
	ws.Handle(g.handleInfo)
	ws.Mount(mux, "/client/info")
	// TODO: wsMus.Mount(mux, "/client/mus")
}

func (g *Game) ListenAndServe(addr string) error {
	// TODO: virtual.Storage
	g.hotel = virtual.NewHotel(nil)
	g.hotel.Load()

	tcp := transport.NewTCP(addr)
	tcp.Handle(g.handle)
	return tcp.Listen()
}

func (g *Game) handle(conn transport.Connection) {
	defer conn.Close()

	logger := slog.New(slog.Default().Handler())
	sess := protocol.NewSession(conn, g.loginRegistry.Commands(), g.hotel, logger)

	sess.Logger.Info("new connection")
	if err := hhentryinit.SendInitialCommands(sess); err != nil {
		sess.Logger.Error("handle", slog.String("err", err.Error()))
		return
	}

	// Phase 1: pre-login
	for {
		p, err := sess.ReadPacket()
		if err != nil {
			sess.Logger.Error("read packet", slog.Any("error", err))
			return
		}

		sess.Logger.Info("<<", slog.Int("cmd", int(p.Command)), slog.String("msg", p.Message.String()))
		if err := g.loginRegistry.Listeners().Handle(p); err != nil {
			sess.Logger.Error("handle", slog.Any("error", err))
			return
		}

		if sess.Habbo != nil {
			break
		}
	}

	// Phase 2: post-login (Habbo guaranteed != nil)
	sess.SetCommands(g.gameRegistry.Commands())

	for {
		p, err := sess.ReadPacket()
		if err != nil {
			sess.Logger.Error("read packet", slog.Any("error", err))
			break
		}

		sess.Logger.Info("<<", slog.Int("cmd", int(p.Command)), slog.String("msg", p.Message.String()))
		if err := g.gameRegistry.Listeners().Handle(p); err != nil {
			sess.Logger.Error("handle", slog.Any("error", err))
			break
		}
	}
}
