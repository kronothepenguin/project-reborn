package habbo

import (
	"log/slog"
	"net"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
	hhclub "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_club"
	hhentryinit "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_entry_init"
	hhkioskroom "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_kiosk_room"
	hhroomutils "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_room_utils"
	hhshared "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_shared"

	"github.com/kronothepenguin/project-reborn/internal/habbo/transport"
)

type Server struct {
	registry protocol.Registry
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) initRegistry() {
	s.registry = protocol.NewRegistry()
	hhclub.Register(s.registry)
	hhentryinit.Register(s.registry)
	hhkioskroom.Register(s.registry)
	hhroomutils.Register(s.registry)
	hhshared.Register(s.registry)
}

func (s *Server) RunTCP() {
	s.initRegistry()

	tcp := transport.NewTCPServer("0.0.0.0:1234")
	tcp.Start()
	tcp.Loop(s.handleTCP)
}

func (s *Server) handleTCP(conn net.Conn) {
	defer conn.Close()

	// TODO: server logger
	slog.Info("new client")
	ctx := NewHabboContext(conn, s.registry)

	if err := ctx.Send(hhentryinit.HELLO); err != nil {
		slog.Error(err.Error())
		return
	}

	if err := ctx.Send(hhentryinit.ENDOFCRYPTOPARAMS); err != nil {
		slog.Error(err.Error())
		return
	}

	for {
		p, err := protocol.ReadPacket(conn)
		if err != nil {
			ctx.logger.Error("read packet", slog.Any("error", err))
			break
		}
		p.Context = ctx

		oldLogger := ctx.logger

		logger := ctx.logger.With(slog.Int("cmd", int(p.Command)))
		logger.Info("", slog.String("msg", p.Message.String()))
		ctx.logger = logger
		if err := s.registry.Listeners().Handle(p); err != nil {
			logger.Error("handle", slog.Any("error", err))
			break
		}

		ctx.logger = oldLogger
	}
}
