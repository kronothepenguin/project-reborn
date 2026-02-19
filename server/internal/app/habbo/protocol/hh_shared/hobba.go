package hhshared

import "github.com/kronothepenguin/project-reborn/internal/app/habbo/protocol"

const CRYFORHELP = "CRYFORHELP"
const PICKED_CRY = "PICKED_CRY"
const DELETE_CRY = "DELETE_CRY"
const CRY_REPLY = "CRY_REPLY"

func registerHobba(registry protocol.Registry) {
	registry.Commands().Register(CRYFORHELP, 148)
	registry.Commands().Register(PICKED_CRY, 149)
	registry.Commands().Register(DELETE_CRY, 273)
	registry.Commands().Register(CRY_REPLY, 274)

	registry.Listeners().Register(48, handlePickCryForHelp)
	registry.Listeners().Register(86, handleCallForHelp)
	registry.Listeners().Register(198, handleChangeCallCategory)
	registry.Listeners().Register(199, handleMessageToCaller)
	registry.Listeners().Register(200, handleModerationAction)
	registry.Listeners().Register(323, handleFollowCryForHelp)
}

func handlePickCryForHelp(packet *protocol.Packet) error {
	id, err := packet.Message.ReadString() // ID
	if err != nil {
		return err
	}

	// packet.Context.Send("PICKED_CRY", StringArg(ID), StringArg(habbo.Name()))
	return packet.Context.Send(PICKED_CRY, protocol.String(id), protocol.String("picker"))
}

func handleCallForHelp(packet *protocol.Packet) error {
	msg, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	typ, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	// TODO: ctx.Hotel().Hobbas().Send(CRY_FOR_HELP, ...)
	return packet.Context.Send(CRYFORHELP, protocol.String(msg), protocol.Int(typ))
}

func handleChangeCallCategory(packet *protocol.Packet) error {
	id, err := packet.Message.ReadString()
	if err != nil {
		return err
	}

	category, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	// TODO: ctx.Hotel().Hobbas().Send(CRY_FOR_HELP, ...)
	return packet.Context.Send(CRYFORHELP, protocol.String(id), protocol.Int(category))
}

func handleMessageToCaller(packet *protocol.Packet) error {
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
	return packet.Context.Send(CRY_REPLY, protocol.String(msg))
}

func handleModerationAction(packet *protocol.Packet) error {
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

func handleFollowCryForHelp(packet *protocol.Packet) error {
	_, err := packet.Message.ReadString() // id
	if err != nil {
		return err
	}
	// TODO: go to room of CFH
	return nil
}
