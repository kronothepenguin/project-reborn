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
	registry.Commands().Register(AVAILABILITYSTATUS, 290)
	registry.Commands().Register(INFOHOTELCLOSING, 291)
	registry.Commands().Register(INFOHOTELCLOSED, 292)
	registry.Commands().Register(AVAILABILITYTIME, 293)
	registry.Commands().Register(LOGINFAILEDHOTELCLOSED, 294)

	registry.Listeners().Register(212, handleGetAvailabilityTime)
}

func handleGetAvailabilityTime(packet *protocol.Packet) error {
	isOpen := 0
	timeUntil := time.Now().UnixMilli()
	return packet.Context.Send(AVAILABILITYTIME, protocol.Int(isOpen), protocol.Int(timeUntil))
}
