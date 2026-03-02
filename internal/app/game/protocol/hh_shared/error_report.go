package hhshared

import "github.com/kronothepenguin/project-reborn/internal/app/game/protocol"

const ERROR_REPORT = "ERROR_REPORT"

func registerErrorReport(registry protocol.Registry) {
	registry.Commands().Register(ERROR_REPORT, 299)
}
