package habbo

import (
	"log/slog"
	"net"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
	hhbuffer "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_buffer"
	hhcatcode "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_cat_code"
	hhclub "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_club"
	hhdynamicdownloader "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_dynamic_downloader"
	hhentryinit "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_entry_init"
	hhfriendlist "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_friend_list"
	hhguide "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_guide"
	hhig "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_ig"
	hhinstantmessenger "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_instant_messenger"
	hhkioskroom "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_kiosk_room"
	hhnavigator "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_navigator"
	hhphoto "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_photo"
	hhpoll "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_poll"
	hhrecycler "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_recycler"
	hhroom "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_room"
	hhroomutils "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_room_utils"
	hhshared "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_shared"
	hhtutorial "github.com/kronothepenguin/project-reborn/internal/habbo/protocol/hh_tutorial"

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
	hhbuffer.Register(s.registry)
	hhcatcode.Register(s.registry)
	hhclub.Register(s.registry)
	hhdynamicdownloader.Register(s.registry)
	hhentryinit.Register(s.registry)
	hhfriendlist.Register(s.registry)
	hhguide.Register(s.registry)
	hhig.Register(s.registry)
	hhinstantmessenger.Register(s.registry)
	hhkioskroom.Register(s.registry)
	hhnavigator.Register(s.registry)
	hhphoto.Register(s.registry)
	hhpoll.Register(s.registry)
	hhrecycler.Register(s.registry)
	hhroom.Register(s.registry)
	hhroomutils.Register(s.registry)
	hhshared.Register(s.registry)
	hhtutorial.Register(s.registry)
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
