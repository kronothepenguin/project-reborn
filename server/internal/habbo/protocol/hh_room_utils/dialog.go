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

// 237
func handleGetPendingCallsForHelp(packet *protocol.Packet) error {
	return nil
}

// 238
func handleDeletePendingCallsForHelp(packet *protocol.Packet) error {
	return nil
}
