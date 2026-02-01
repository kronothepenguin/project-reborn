package hhinstantmessenger

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

const IMMESSAGE = "IMMESSAGE"
const IMINVITATION = "IMINVITATION"
const IMERROR = "IMERROR"
const INVITATIONERROR = "INVITATIONERROR"

func Register(registry protocol.Registry) {
	registry.Commands().Register(IMMESSAGE, 134)
	registry.Commands().Register(IMINVITATION, 135)
	registry.Commands().Register(IMERROR, 261)
	registry.Commands().Register(INVITATIONERROR, 262)

	registry.Listeners().Register(33, handleMESSENGER_SENDMSG)
	registry.Listeners().Register(34, handleFRIEND_INVITE)
}

func handleMESSENGER_SENDMSG(*protocol.Packet) error { return nil }
func handleFRIEND_INVITE(*protocol.Packet) error     { return nil }
