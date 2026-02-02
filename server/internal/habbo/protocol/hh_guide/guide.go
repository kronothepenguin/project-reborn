package hhguide

import (
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
)

const INVITATION = "INVITATION"
const INVITATIONFOLLOWFAILED = "INVITATIONFOLLOWFAILED"
const INVITATIONCANCELLED = "INVITATIONCANCELLED"
const INITTUTORSERVICESTATUS = "INITTUTORSERVICESTATUS"
const ENABLETUTORSERVICESTATUS = "ENABLETUTORSERVICESTATUS"

func Register(registry protocol.Registry) {
	registry.Commands().Register(INVITATION, 355)
	registry.Commands().Register(INVITATIONFOLLOWFAILED, 359)
	registry.Commands().Register(INVITATIONCANCELLED, 360)
	registry.Commands().Register(INITTUTORSERVICESTATUS, 425)
	registry.Commands().Register(ENABLETUTORSERVICESTATUS, 426)

	registry.Listeners().Register(357, handleMSG_ACCEPT_TUTOR_INVITATION)
	registry.Listeners().Register(358, handleMSG_REJECT_TUTOR_INVITATION)
	registry.Listeners().Register(360, handleMSG_INIT_TUTORSERVICE)
	registry.Listeners().Register(362, handleMSG_WAIT_FOR_TUTOR_INVITATIONS)
	registry.Listeners().Register(363, handleMSG_CANCEL_WAIT_FOR_TUTOR_INVITATIONS)
}

func handleMSG_ACCEPT_TUTOR_INVITATION(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleMSG_ACCEPT_TUTOR_INVITATION")
	return nil
}

func handleMSG_REJECT_TUTOR_INVITATION(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleMSG_REJECT_TUTOR_INVITATION")
	return nil
}

func handleMSG_INIT_TUTORSERVICE(packet *protocol.Packet) error {
	state := 1 // 1 - enabled, 2 - disable, 3 - disabled

	packet.Context.Logger().Debug(
		"handleMSG_INIT_TUTORSERVICE",
		slog.Int("state", state),
	)

	return packet.Context.Send(INITTUTORSERVICESTATUS, protocol.Int(state))
}

func handleMSG_WAIT_FOR_TUTOR_INVITATIONS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleMSG_WAIT_FOR_TUTOR_INVITATIONS")
	return nil
}

func handleMSG_CANCEL_WAIT_FOR_TUTOR_INVITATIONS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleMSG_CANCEL_WAIT_FOR_TUTOR_INVITATIONS")
	return nil
}
