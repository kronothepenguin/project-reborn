package hhroomutils

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

const GET_PENDING_RESPONSE = "GET_PENDING_RESPONSE"
const PENDING_CFHS_DELETED = "PENDING_CFHS_DELETED"
const CFH_SENDING_RESPONSE = "CFH_SENDING_RESPONSE"

func Register(registry protocol.Registry) {
	registry.Commands().Register(GET_PENDING_RESPONSE, 319)
	registry.Commands().Register(PENDING_CFHS_DELETED, 320)
	registry.Commands().Register(CFH_SENDING_RESPONSE, 321)

	registry.Listeners().Register(237, handleGetPendingCallsForHelp)
	registry.Listeners().Register(238, handleDeletePendingCallsForHelp)
}

func handleGetPendingCallsForHelp(packet *protocol.Packet) error {
	// TODO: pending cfh
	// protocol.Int(count), protocol.Int(id), protocol.String(timestamp), protocol.String(cfh)
	return packet.Context.Send(GET_PENDING_RESPONSE, protocol.Int(0))
}

func handleDeletePendingCallsForHelp(packet *protocol.Packet) error {
	// TODO: delete pending cfh
	return packet.Context.Send(PENDING_CFHS_DELETED)
}
