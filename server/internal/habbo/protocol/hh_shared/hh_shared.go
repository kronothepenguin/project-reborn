package hhshared

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

func Register(registry protocol.Registry) {
	registerErrorReport(registry)
	registerHobba(registry)
}
