package hhshared

import "github.com/kronothepenguin/project-reborn/apps/server/internal/protocol"

func Register(registry protocol.Registry) {
	registerErrorReport(registry)
	registerHobba(registry)
}
