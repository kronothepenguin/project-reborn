package hhshared

import "github.com/kronothepenguin/project-reborn/internal/app/habbo/game/protocol"

func Register(registry protocol.Registry) {
	registerErrorReport(registry)
	registerHobba(registry)
}
