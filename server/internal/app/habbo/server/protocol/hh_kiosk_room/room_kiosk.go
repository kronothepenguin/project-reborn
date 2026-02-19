package hhkioskroom

import (
	"strings"

	"github.com/kronothepenguin/project-reborn/internal/app/habbo/server/protocol"
)

const FLATCREATED = "FLATCREATED"
const ERROR = "ERROR"
const WEBSHORTCUT = "WEBSHORTCUT"

func Register(registry protocol.Registry) {
	registry.Commands().Register(FLATCREATED, 59)
	registry.Commands().Register(ERROR, 33)
	registry.Commands().Register(WEBSHORTCUT, 353)

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
	return packet.Context.Send(FLATCREATED, protocol.RawString("id\nflat_name"))
}
