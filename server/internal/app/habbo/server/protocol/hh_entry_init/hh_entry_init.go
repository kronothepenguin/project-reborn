package hhentryinit

import "github.com/kronothepenguin/project-reborn/internal/app/habbo/server/protocol"

func Register(registry protocol.Registry) {
	registerLogin(registry)
	registerOpeningHours(registry)
}
