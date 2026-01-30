package habbo

import (
	"log/slog"
	"net"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
	hhentryinit "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_entry_init"
	hhkioskroom "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_kiosk_room"
	hhroomutils "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_room_utils"
	hhshared "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_shared"
	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol/registry"
	"github.com/kronothepenguin/project-reborn/internal/habbo/transport"
)

type Server struct {
	registry *registry.Registry
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) RunTCP() {
	s.registry = registry.New()
	hhshared.Register(s.registry)
	hhkioskroom.Register(s.registry)
	hhroomutils.Register(s.registry)
	hhentryinit.Register(s.registry)

	tcp := transport.NewTCPServer("0.0.0.0:1234")
	tcp.Start()
	tcp.Loop(s.handleTCP)
}

func (s *Server) handleTCP(conn net.Conn) {
	defer conn.Close()

	slog.Info("new client")
	ctx := NewHabboContext(conn, s.registry)
	protocol.WritePacket(conn, protocol.NewPacket(1, nil))

	for {
		p, err := protocol.ReadPacket(conn)
		if err != nil {
			ctx.logger.Error("read packet", slog.Any("error", err))
			break
		}

		oldLogger := ctx.logger

		logger := ctx.logger.With(slog.Int("cmd", int(p.Command)))
		logger.Info(p.Message.String())
		ctx.logger = logger
		if err := s.registry.Messages.Handle(ctx, p); err != nil {
			logger.Error("handle", slog.Any("error", err))
			break
		}

		ctx.logger = oldLogger
	}
}
