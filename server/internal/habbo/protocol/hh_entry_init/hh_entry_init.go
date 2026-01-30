package hhentryinit

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

func Register(registry protocol.Registry) {
	registerLogin(registry)
	registerOpeningHours(registry)
}
