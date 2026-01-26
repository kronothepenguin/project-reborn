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

const CRY_FOR_HELP = "CRY_FOR_HELP"
const PICKED_CRY = "PICKED_CRY"
const DELETE_CRY = "DELETE_CRY"
const CRY_REPLY = "CRY_REPLY"

func Register(registry protocol.Registry) {
	registry.RegisterCommand(CRY_FOR_HELP, 148)
	registry.RegisterCommand(PICKED_CRY, 149)
	registry.RegisterCommand(DELETE_CRY, 273)
	registry.RegisterCommand(CRY_REPLY, 274)

	registry.RegisterListener(48, handlePickCryForHelp)
	registry.RegisterListener(86, handleCallForHelp)
	registry.RegisterListener(198, handleChangeCallCategory)
	registry.RegisterListener(199, handleMessageToCaller)
	registry.RegisterListener(200, handleModerationAction)
	registry.RegisterListener(323, handleFollowCryForHelp)
}

func handlePickCryForHelp(ctx protocol.Context, packet *protocol.Packet) error {
	id, err := packet.Message.ReadString() // ID
	if err != nil {
		return err
	}

	// ctx.Send("PICKED_CRY", StringArg(ID), StringArg(habbo.Name()))
	return ctx.Send(PICKED_CRY, protocol.String(id), protocol.String("picker"))
}

func handleCallForHelp(ctx protocol.Context, packet *protocol.Packet) error {
	msg, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	typ, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	// TODO: ctx.Hotel().Hobbas().Send(CRY_FOR_HELP, ...)
	return ctx.Send(CRY_FOR_HELP, protocol.String(msg), protocol.Int(typ))
}

func handleChangeCallCategory(ctx protocol.Context, packet *protocol.Packet) error {
	id, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	category, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	// TODO: ctx.Hotel().Hobbas().Send(CRY_FOR_HELP, ...)
	return ctx.Send(CRY_FOR_HELP, protocol.String(id), protocol.Int(category))
}

func handleMessageToCaller(ctx protocol.Context, packet *protocol.Packet) error {
	_, err := packet.Message.ReadString() // id
	if err != nil {
		return err
	}

	msg, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	// TODO: caller := ctx.Hotel().Hobbas().FindCallerOf(id)
	// TOOD: caller.send(CRY_REPLY, msg)
	return ctx.Send(CRY_REPLY, protocol.String(msg))
}

func handleModerationAction(ctx protocol.Context, packet *protocol.Packet) error {
	target, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	action, err := packet.Message.ReadInt()
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
		// TODO: handleBan
	case target == 0 && action == 0:
		// alert
		packet.Message.ReadString() // reason
		packet.Message.ReadString() // extra info
		packet.Message.ReadString() // name
		// TODO: handleAlert
	case target == 0 && action == 1:
		// kick
		packet.Message.ReadString() // reason
		packet.Message.ReadString() // extra info
		packet.Message.ReadString() // name
		// TODO: handleKick
	case target == 1 && action == 1:
		// roomkick
		packet.Message.ReadString() // reason
		packet.Message.ReadString() // extra info
		// TODO: handleRoomKick
	case target == 1 && action == 0:
		// roomalert
		packet.Message.ReadString() // reason
		packet.Message.ReadString() // extra info
		// TODO: handleRoomAlert
	}

	return nil
}

func handleFollowCryForHelp(ctx protocol.Context, packet *protocol.Packet) error {
	_, err := packet.Message.ReadString() // id
	if err != nil {
		return err
	}
	// TODO: go to room of CFH
	return nil
}
