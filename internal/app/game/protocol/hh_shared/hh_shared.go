package hhshared

import "github.com/kronothepenguin/project-reborn/internal/app/game/protocol"

func Register(registry protocol.Registry) {
	registerErrorReport(registry)
	registerHobba(registry)
}
