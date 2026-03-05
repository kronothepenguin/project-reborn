package game

import (
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
)

func createRegistry() protocol.Registry {
	registry := protocol.NewRegistry()
	hhbuffer.Register(registry)
	hhcatcode.Register(registry)
	hhclub.Register(registry)
	hhdynamicdownloader.Register(registry)
	hhentryinit.Register(registry)
	hhfriendlist.Register(registry)
	hhguide.Register(registry)
	hhig.Register(registry)
	hhinstantmessenger.Register(registry)
	hhkioskroom.Register(registry)
	hhnavigator.Register(registry)
	hhphoto.Register(registry)
	hhpoll.Register(registry)
	hhrecycler.Register(registry)
	hhroom.Register(registry)
	hhroomutils.Register(registry)
	hhshared.Register(registry)
	hhtutorial.Register(registry)
	return registry
}
