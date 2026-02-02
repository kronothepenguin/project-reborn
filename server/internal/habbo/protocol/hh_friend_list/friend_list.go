package hhfriendlist

import (
	"log/slog"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
)

const OK = "OK"
const FRIENDLISTINIT = "FRIENDLISTINIT"
const FRIENDLISTUPDATE = "FRIENDLISTUPDATE"
const FRIENDREQUEST = "FRIENDREQUEST"
const ERROR = "ERROR"
const FRIENDREQUESTLIST = "FRIENDREQUESTLIST"
const FRIENDREQUESTRESULT = "FRIENDREQUESTRESULT"
const FOLLOWFAILED = "FOLLOWFAILED"
const MAILNOTIFICATION = "MAILNOTIFICATION"
const MAILCOUNTNOTIFICATION = "MAILCOUNTNOTIFICATION"
const HABBOSEARCHRESULT = "HABBOSEARCHRESULT"

func Register(registry protocol.Registry) {
	registry.Commands().Register(OK, 3)
	registry.Commands().Register(FRIENDLISTINIT, 12)
	registry.Commands().Register(FRIENDLISTUPDATE, 13)
	registry.Commands().Register(FRIENDREQUEST, 132)
	registry.Commands().Register(ERROR, 260)
	registry.Commands().Register(FRIENDREQUESTLIST, 314)
	registry.Commands().Register(FRIENDREQUESTRESULT, 315)
	registry.Commands().Register(FOLLOWFAILED, 349)
	registry.Commands().Register(MAILNOTIFICATION, 363)
	registry.Commands().Register(MAILCOUNTNOTIFICATION, 364)
	registry.Commands().Register(HABBOSEARCHRESULT, 435)

	registry.Listeners().Register(12, handleFRIENDLIST_INIT)
	registry.Listeners().Register(15, handleFRIENDLIST_UPDATE)
	registry.Listeners().Register(32, handleFRIENDLIST_GETOFFLINEFRIENDS)
	registry.Listeners().Register(40, handleFRIENDLIST_REMOVEFRIEND)
	registry.Listeners().Register(41, handleMESSENGER_HABBOSEARCH)
	registry.Listeners().Register(37, handleFRIENDLIST_ACCEPTFRIEND)
	registry.Listeners().Register(38, handleFRIENDLIST_DECLINEFRIEND)
	registry.Listeners().Register(39, handleFRIENDLIST_FRIENDREQUEST)
	registry.Listeners().Register(233, handleFRIENDLIST_GETFRIENDREQUESTS)
	registry.Listeners().Register(262, handleFOLLOW_FRIEND)
}

func handleFRIENDLIST_INIT(packet *protocol.Packet) error {
	userLimit := 25
	normalLimit := 25
	extendedLimit := 0
	categoryCount := 0
	friendCount := 0
	friendRequestLimit := 5
	friendRequestCount := 0

	packet.Context.Logger().Debug(
		"handleFRIENDLIST_INIT",
		slog.Int("userLimit", userLimit),
		slog.Int("normalLimit", normalLimit),
		slog.Int("extendedLimit", extendedLimit),
		slog.Int("categoryCount", categoryCount),
		slog.Int("friendCount", friendCount),
		slog.Int("friendRequestLimit", friendRequestLimit),
		slog.Int("friendRequestCount", friendRequestCount),
	)

	return packet.Context.Send(FRIENDLISTINIT,
		protocol.Int(userLimit),
		protocol.Int(normalLimit),
		protocol.Int(extendedLimit),
		protocol.Int(categoryCount),
		protocol.Int(friendCount),
		protocol.Int(friendRequestLimit),
		protocol.Int(friendRequestCount))
}

func handleFRIENDLIST_UPDATE(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleFRIENDLIST_UPDATE")
	return nil
}

func handleFRIENDLIST_GETOFFLINEFRIENDS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleFRIENDLIST_GETOFFLINEFRIENDS")
	return nil
}

func handleFRIENDLIST_REMOVEFRIEND(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleFRIENDLIST_REMOVEFRIEND")
	return nil
}

func handleMESSENGER_HABBOSEARCH(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleMESSENGER_HABBOSEARCH")
	return nil
}

func handleFRIENDLIST_ACCEPTFRIEND(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleFRIENDLIST_ACCEPTFRIEND")
	return nil
}

func handleFRIENDLIST_DECLINEFRIEND(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleFRIENDLIST_DECLINEFRIEND")
	return nil
}

func handleFRIENDLIST_FRIENDREQUEST(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleFRIENDLIST_FRIENDREQUEST")
	return nil
}

func handleFRIENDLIST_GETFRIENDREQUESTS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleFRIENDLIST_GETFRIENDREQUESTS")
	return nil
}

func handleFOLLOW_FRIEND(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleFOLLOW_FRIEND")
	return nil
}
