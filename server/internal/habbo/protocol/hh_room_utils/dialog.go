package hhroomutils

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

func buildGetPendingResponse() *protocol.Packet {
	message := protocol.NewMessage()
	message.WriteInt(0) // count
	return protocol.NewPacket(319, message)
}

func buildPendingCallsForHelpDeleted() *protocol.Packet {
	return protocol.NewPacket(320, protocol.NewMessage())
}

func buildCallForHelpSendingResponse() *protocol.Packet {
	message := protocol.NewMessage()
	message.WriteInt(0) // status
	return protocol.NewPacket(321, message)
}

const GET_PENDING_RESPONSE = "GET_PENDING_RESPONSE"
const PENDING_CFHS_DELETED = "PENDING_CFHS_DELETED"
const CFH_SENDING_RESPONSE = "CFH_SENDING_RESPONSE"

func Register(registry protocol.Registry) {
	registry.RegisterCommand(GET_PENDING_RESPONSE, 319)
	registry.RegisterCommand(PENDING_CFHS_DELETED, 320)
	registry.RegisterCommand(CFH_SENDING_RESPONSE, 321)

	registry.RegisterListener(237, handleGetPendingCallsForHelp)
	registry.RegisterListener(238, handleDeletePendingCallsForHelp)
}

func handleGetPendingCallsForHelp(ctx protocol.Context, packet *protocol.Packet) error {
	// TODO: pending cfh
	// protocol.Int(count), protocol.Int(id), protocol.String(timestamp), protocol.String(cfh)
	return ctx.Send(GET_PENDING_RESPONSE, protocol.Int(0))
}

func handleDeletePendingCallsForHelp(ctx protocol.Context, packet *protocol.Packet) error {
	// TODO: delete pending cfh
	return ctx.Send(PENDING_CFHS_DELETED)
}
