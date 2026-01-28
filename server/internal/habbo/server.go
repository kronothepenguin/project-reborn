package habbo

import (
	"fmt"
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

func (s *Server) RunTCP() {
	s.registry = registry.New()
	hhshared.Register(s.registry)
	hhkioskroom.Register(s.registry)
	hhroomutils.Register(s.registry)

	tcp := transport.NewTCPServer(":1234")
	tcp.Start()
	tcp.Loop(s.handleTCP)
}

func (s *Server) handleTCP(conn net.Conn) {
	defer conn.Close()

	ctx := NewHabboContext(conn, s.registry)

	for {
		p, err := protocol.ReadPacket(conn)
		if err != nil {
			ctx.logger.Println(err)
			break
		}

		ctx.logger.SetPrefix(fmt.Sprintf("[%d]", p.Cmd))
		ctx.logger.Println(p.Message.Bytes())
		if err := s.registry.Messages.Handle(ctx, p); err != nil {
			ctx.logger.Println(err)
			break
		}
		ctx.logger.SetPrefix("")
	}
}
