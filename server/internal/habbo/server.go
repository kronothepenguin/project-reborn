package habbo

import (
	"net"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
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

func (s *Server) StartTCP() {
	s.registry = registry.New()
	hhshared.Register(s.registry)
	hhkioskroom.Register(s.registry)
	hhroomutils.Register(s.registry)

	tcp := transport.NewTCPServer(":1234")
	tcp.Start()
	go tcp.Loop(s.handleTCP)
}

func (s *Server) handleTCP(conn net.Conn) {
	defer conn.Close()

	ctx := NewHabboContext(conn, s.registry)

	for {
		p, err := protocol.ReadPacket(conn)
		if err != nil {
			break
		}

		if err := s.registry.Messages.Handle(ctx, p); err != nil {
			break
		}
	}
}
