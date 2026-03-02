package hhentryinit

import "github.com/kronothepenguin/project-reborn/internal/app/habbo/game/protocol"

func Register(registry protocol.Registry) {
	registerLogin(registry)
	registerOpeningHours(registry)
}
