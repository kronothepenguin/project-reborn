package hhentryinit

import (
	"time"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
)

const AVAILABILITYSTATUS = "AVAILABILITYSTATUS"
const INFOHOTELCLOSING = "INFOHOTELCLOSING"
const INFOHOTELCLOSED = "INFOHOTELCLOSED"
const AVAILABILITYTIME = "AVAILABILITYTIME"
const LOGINFAILEDHOTELCLOSED = "LOGINFAILEDHOTELCLOSED"

func registerOpeningHours(registry protocol.Registry) {
	registry.RegisterCommand(AVAILABILITYSTATUS, 290)
	registry.RegisterCommand(INFOHOTELCLOSING, 291)
	registry.RegisterCommand(INFOHOTELCLOSED, 292)
	registry.RegisterCommand(AVAILABILITYTIME, 293)
	registry.RegisterCommand(LOGINFAILEDHOTELCLOSED, 294)

	registry.RegisterListener(212, handleGetAvailabilityTime)
}

func handleGetAvailabilityTime(ctx protocol.Context, packet *protocol.Packet) error {
	isOpen := 0
	timeUntil := time.Now().UnixMilli()
	return ctx.Send(AVAILABILITYTIME, protocol.Int(isOpen), protocol.Int(timeUntil))
}
