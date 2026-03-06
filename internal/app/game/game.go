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

func New(hotel *virtual.Hotel) *Game {
	return &Game{
		loginRegistry: createLoginRegistry(),
		gameRegistry:  createGameRegistry(),

		hotel: hotel,
	}
}

func (g *Game) Mount(mux *http.ServeMux) {
	ws := transport.NewWebSocket()
	ws.Handle(g.handleInfo)
	ws.Mount(mux, "/client/info")
	// TODO: wsMus.Mount(mux, "/client/mus")
}

func (g *Game) ListenAndServe(addr string) error {
	tcp := transport.NewTCP(addr)
	tcp.Handle(g.handleInfo)
	return tcp.Listen()
}

func (g *Game) handleInfo(conn transport.Connection) {
	defer conn.Close()

	logger := slog.New(slog.Default().Handler())
	session := protocol.NewSession(conn, g.loginRegistry.Commands(), g.hotel, logger)

	if err := hhentryinit.SendInitialCommands(session); err != nil {
		session.Logger.Error("handleInfo", slog.String("err", err.Error()))
		return
	}

	for {
		p, err := session.ReadPacket()
		if err != nil {
			session.Logger.Error("read packet", slog.Any("error", err))
			return
		}

		session.Logger.Info("<<", slog.Int("cmd", int(p.Command)), slog.String("msg", p.Message.String()))
		if err := g.loginRegistry.Listeners().Handle(p); err != nil {
			session.Logger.Error("handle", slog.Any("error", err))
			return
		}

		if session.Habbo != nil {
			break
		}
	}

	session.Habbo.Connection = session
	defer func() { session.Habbo.Connection = virtual.NopConnection() }()

	session.SetCommands(g.gameRegistry.Commands())

	for {
		p, err := session.ReadPacket()
		if err != nil {
			session.Logger.Error("read packet", slog.Any("error", err))
			break
		}

		session.Logger.Info("<<", slog.Int("cmd", int(p.Command)), slog.String("msg", p.Message.String()))
		if err := g.gameRegistry.Listeners().Handle(p); err != nil {
			session.Logger.Error("handle", slog.Any("error", err))
			break
		}
	}
}
