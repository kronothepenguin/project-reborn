package hhkioskroom

import (
	"strings"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
)

func buildFlatCreated() *protocol.Packet {
	message := protocol.NewMessage()
	message.WriteRawString("id\nname")
	return protocol.NewPacket(59, message)
}

func buildError() *protocol.Packet {
	message := protocol.NewMessage()
	message.WriteRawString("Error creating a private room")
	return protocol.NewPacket(33, message)
}

func buildWebShortcut() *protocol.Packet {
	message := protocol.NewMessage()
	message.WriteInt(1) // request id
	return protocol.NewPacket(353, message)
}

const FLAT_CREATED = "FLAT_CREATED"
const ERROR = "ERROR"
const WEB_SHORTCUT = "WEB_SHORTCUT"

func Register(registry protocol.Registry) {
	registry.Commands().Register(FLAT_CREATED, 59)
	registry.Commands().Register(ERROR, 33)
	registry.Commands().Register(WEB_SHORTCUT, 353)

	registry.Listeners().Register(29, handleCreateFlat)
}

func handleCreateFlat(packet *protocol.Packet) error {
	raw := packet.Message.ReadRawString()
	data := strings.Split(raw, "/")
	strings.TrimSpace(data[1]) // "first floor"
	strings.TrimSpace(data[2]) // name
	strings.TrimSpace(data[3]) // marker
	strings.TrimSpace(data[4]) // door
	strings.TrimSpace(data[5]) // showOwnerName
	return packet.Context.Send(FLAT_CREATED, protocol.RawString("id\nflat_name"))
}
