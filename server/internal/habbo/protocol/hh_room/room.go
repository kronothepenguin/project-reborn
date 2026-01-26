package hhroom

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

func buildDisconnect() *protocol.Packet {
	message := protocol.NewMessage()
	return protocol.NewPacket(-1, message)
}

func buildCLC() *protocol.Packet {
	message := protocol.NewMessage()
	return protocol.NewPacket(18, message)
}
