package game

import (
	"log"
	"log/slog"
	"net"

	"github.com/kronothepenguin/project-reborn/internal/app/game/protocol"
	hhbuffer "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_buffer"
	hhcatcode "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_cat_code"
	hhclub "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_club"
	hhdynamicdownloader "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_dynamic_downloader"
	hhentryinit "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_entry_init"
	hhfriendlist "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_friend_list"
	hhguide "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_guide"
	hhig "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_ig"
	hhinstantmessenger "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_instant_messenger"
	hhkioskroom "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_kiosk_room"
	hhnavigator "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_navigator"
	hhphoto "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_photo"
	hhpoll "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_poll"
	hhrecycler "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_recycler"
	hhroom "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_room"
	hhroomutils "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_room_utils"
	hhshared "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_shared"
	hhtutorial "github.com/kronothepenguin/project-reborn/internal/app/game/protocol/hh_tutorial"
	"github.com/kronothepenguin/project-reborn/internal/app/game/transport"
	"github.com/kronothepenguin/project-reborn/internal/app/habbo/virtual"
)

type Server struct {
	registry protocol.Registry

	hotel *virtual.Hotel
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

	// TODO: virtual.Storage
	s.hotel = virtual.NewHotel(nil)
	s.hotel.Load()

	slog.SetLogLoggerLevel(slog.LevelDebug)

	log.Println("running 0.0.0.0:1234")
	tcp := transport.NewTCPServer("0.0.0.0:1234")
	tcp.Start()
	tcp.Loop(s.handleTCP)
}

func (s *Server) handleTCP(conn net.Conn) {
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
