package hhshared

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

type CryForHelpType int

const (
	TypeInstant CryForHelpType = iota - 1
	TypePublic
	TypePrivate
	TypeGame
)

// 148
func buildCryForHelp() *protocol.Packet {
	message := protocol.NewMessage()
	message.WriteString("") // cry_id
	message.WriteInt(0)     // category
	message.WriteString("") // time
	message.WriteString("") // sender
	message.WriteString("") // message
	message.WriteString("") // url_id
	message.WriteString("") // roomname
	switch TypeInstant {
	case TypeInstant:
		message.WriteInt(-1) // type
	case TypePublic:
		message.WriteInt(0)     // type
		message.WriteString("") // casts
		message.WriteInt(0)     // port
		message.WriteInt(0)     // door
		message.WriteInt(0)     // room_id
	case TypePrivate:
		message.WriteInt(1)     // type
		message.WriteString("") // marker
		message.WriteInt(0)     // room_id
		message.WriteString("") // owner
	case TypeGame:
		message.WriteInt(2)     // type
		message.WriteString("") // casts
		message.WriteInt(0)     // port
		message.WriteInt(0)     // door
	}
	return protocol.NewPacket(148, message)
}

// 149
func buildPickedCry() *protocol.Packet {
	message := protocol.NewMessage()
	message.WriteString("") // ID
	message.WriteString("") // picker
	return protocol.NewPacket(149, message)
}

// 273
func buildDeleteCry() *protocol.Packet {
	message := protocol.NewMessage()
	message.WriteString("") // ID
	return protocol.NewPacket(273, message)
}

// 274
func buildCryReply() *protocol.Packet {
	message := protocol.NewMessage()
	message.WriteString("") // text
	return protocol.NewPacket(274, message)
}

// 48
func handlePickCryForHelp(packet *protocol.Packet) error {
	packet.Message.ReadString() // ID
	return nil
}

// 86
func handleCallForHelp(packet *protocol.Packet) error {
	packet.Message.ReadString() // message
	packet.Message.ReadInt()    // type
	return nil
}

// 198
func handleChangeCallCategory(packet *protocol.Packet) error {
	packet.Message.ReadString() // ID
	packet.Message.ReadInt()    // category
	return nil
}

// 199
func handleMessageToCaller(packet *protocol.Packet) error {
	packet.Message.ReadString() // ID
	packet.Message.ReadString() // message
	return nil
}

// 200
func handleModerationAction(packet *protocol.Packet) error {
	target, err := packet.Message.ReadInt() // target
	if err != nil {
		return err
	}
	action, err := packet.Message.ReadInt() // action
	if err != nil {
		return err
	}

	switch {
	case target == 0 && action == 2:
		// ban
		packet.Message.ReadString() // reason
		packet.Message.ReadString() // extra info
		packet.Message.ReadString() // name
		packet.Message.ReadInt()    // hours
		packet.Message.ReadInt()    // ban computer
		packet.Message.ReadInt()    // ban ip
	case target == 0 && action == 0:
		// alert
		packet.Message.ReadString() // reason
		packet.Message.ReadString() // extra info
		packet.Message.ReadString() // name
	case target == 0 && action == 1:
		// kick
		packet.Message.ReadString() // reason
		packet.Message.ReadString() // extra info
		packet.Message.ReadString() // name
	case target == 1 && action == 1:
		// roomkick
		packet.Message.ReadString() // reason
		packet.Message.ReadString() // extra info
	case target == 1 && action == 0:
		// roomalert
		packet.Message.ReadString() // reason
		packet.Message.ReadString() // extra info
	}

	return nil
}

// 323
func handleFollowCryForHelp(packet *protocol.Packet) error {
	packet.Message.ReadString() // ID
	return nil
}
