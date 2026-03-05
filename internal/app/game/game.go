package game

import (
	"log/slog"
	"net"
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/app/game/protocol"
	hhentryinit "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_entry_init"
	"github.com/kronothepenguin/project-reborn/internal/app/game/transport"
	"github.com/kronothepenguin/project-reborn/internal/pkg/virtual"
)

type Game struct {
	registry protocol.Registry

	hotel *virtual.Hotel
}

func New() *Game {
	return &Game{
		registry: createRegistry(),
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

func (s *Game) Mount(mux *http.ServeMux) {
	ws := transport.NewWebSocket()
	ws.Handle(s.handleInfo)
	ws.Mount(mux, "/client/info")
	// TODO: wsMus.Mount(mux, "/client/mus")
}

func (s *Game) ListenAndServe(addr string) error {
	// TODO: virtual.Storage
	s.hotel = virtual.NewHotel(nil)
	s.hotel.Load()

	tcp := transport.NewTCP(addr)
	tcp.Handle(s.handleInfo)
	return tcp.Listen()
}

func (s *Game) handleTCP(conn net.Conn) {
	defer conn.Close()

	ctx := NewHabboContext(conn, s.registry, s.hotel)

	ctx.logger.Info("new connection")
	if err := hhentryinit.SendInitialCommands(ctx); err != nil {
		ctx.logger.Error("handle", slog.String("err", err.Error()))
		return
	}

	for {
		p, err := protocol.ReadPacket(conn, ctx.Crypto())
		if err != nil {
			ctx.logger.Error("read packet", slog.Any("error", err))
			break
		}
		p.Context = ctx

		// oldLogger := ctx.logger

		// logger := ctx.logger.With(slog.Int("cmd", int(p.Command)))
		// logger.Info("<<", slog.String("msg", p.Message.String()))
		// ctx.logger = logger
		ctx.logger.Info("<<", slog.Int("cmd", int(p.Command)), slog.String("msg", p.Message.String()))
		if err := s.registry.Listeners().Handle(p); err != nil {
			ctx.logger.Error("handle", slog.Any("error", err))
			break
		}

		// ctx.logger = oldLogger
	}
}
