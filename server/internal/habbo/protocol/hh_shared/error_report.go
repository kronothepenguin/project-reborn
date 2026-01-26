package hhshared

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

func buildErrorReport() *protocol.Packet {
	message := protocol.NewMessage()
	message.WriteInt(0)     // error id
	message.WriteInt(0)     // error message id
	message.WriteString("") // time
	return protocol.NewPacket(299, message)
}
