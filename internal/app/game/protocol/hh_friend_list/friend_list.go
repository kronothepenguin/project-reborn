package hhfriendlist

import (
	"errors"
	"io"
	"slices"

	"github.com/kronothepenguin/project-reborn/internal/app/game/protocol"
	"github.com/kronothepenguin/project-reborn/internal/pkg/virtual"
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

	registry.Listeners().Register(12, handleFriendListInit)
	registry.Listeners().Register(15, handleFriendListUpdate)
	registry.Listeners().Register(32, handleFriendListGetOfflineFriends)
	registry.Listeners().Register(40, handleFRIENDLIST_REMOVEFRIEND)
	registry.Listeners().Register(41, handleMESSENGER_HABBOSEARCH)
	registry.Listeners().Register(37, handleFRIENDLIST_ACCEPTFRIEND)
	registry.Listeners().Register(38, handleFRIENDLIST_DECLINEFRIEND)
	registry.Listeners().Register(39, handleFRIENDLIST_FRIENDREQUEST)
	registry.Listeners().Register(233, handleFRIENDLIST_GETFRIENDREQUESTS)
	registry.Listeners().Register(262, handleFOLLOW_FRIEND)
}

// FRIENDLIST_INIT
func handleFriendListInit(packet *protocol.Packet) error {
	hotel := packet.Session.Hotel

	habbo := packet.Session.Habbo

	habbo.Mu.RLock()
	defer habbo.Mu.RUnlock()

	packet.Session.Logger.Debug("handleFriendListInit")

	var args []io.WriterTo
	args = append(
		args,
		protocol.Int(hotel.Settings.FriendListLimit+habbo.FriendList.ExtendedLimit),
		protocol.Int(hotel.Settings.FriendListLimit),
		protocol.Int(habbo.FriendList.ExtendedLimit),
	)

	args = slices.Concat(
		args,
		serializeCategories(habbo.FriendList.Categories),
		serializeFriends(habbo.FriendList.Friends),
	)

	args = append(
		args,
		protocol.Int(hotel.Settings.FriendRequestLimit),
		protocol.Int(len(habbo.FriendList.Requests)),
	)

	return packet.Session.Send(FRIENDLISTINIT, args...)
}

// FRIENDLIST_UPDATE
func handleFriendListUpdate(packet *protocol.Packet) error {
	habbo := packet.Session.Habbo

	habbo.Mu.RLock()
	defer habbo.Mu.RUnlock()

	packet.Session.Logger.Debug("handleFriendListUpdate")

	var args []io.WriterTo

	args = slices.Concat(
		args,
		serializeCategories(habbo.FriendList.Categories),    // TODO: only send updates
		serializeUpdateFriends(habbo.FriendList.Friends, 0), // TODO: only send pending friends
	)

	return packet.Session.Send(FRIENDLISTUPDATE)
}

// FRIENDLIST_GETOFFLINEFRIENDS
func handleFriendListGetOfflineFriends(packet *protocol.Packet) error {
	// client doesn't call this

	packet.Session.Logger.Debug("handleFriendListGetOfflineFriends")

	return errors.New("unknown")
}

func handleFRIENDLIST_REMOVEFRIEND(packet *protocol.Packet) error {
	_, err := packet.Message.ReadInt() // always 1
	if err != nil {
		return err
	}

	friendID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	packet.Session.Logger.Debug("handleFRIENDLIST_REMOVEFRIEND")

	var args []io.WriterTo
	args = append(
		args,
		protocol.Int(0),  // do not update categories
		protocol.Int(1),  // 1 friend update
		protocol.Int(-1), // remove operation
		protocol.Int(friendID),
	)

	// TODO: send other habbo update if online
	return packet.Session.Send(FRIENDLISTUPDATE, args...)
}

func handleMESSENGER_HABBOSEARCH(packet *protocol.Packet) error {
	packet.Session.Logger.Debug("handleMESSENGER_HABBOSEARCH")
	return nil
}

func handleFRIENDLIST_ACCEPTFRIEND(packet *protocol.Packet) error {
	packet.Session.Logger.Debug("handleFRIENDLIST_ACCEPTFRIEND")
	return nil
}

func handleFRIENDLIST_DECLINEFRIEND(packet *protocol.Packet) error {
	packet.Session.Logger.Debug("handleFRIENDLIST_DECLINEFRIEND")
	return nil
}

func handleFRIENDLIST_FRIENDREQUEST(packet *protocol.Packet) error {
	packet.Session.Logger.Debug("handleFRIENDLIST_FRIENDREQUEST")
	return nil
}

func handleFRIENDLIST_GETFRIENDREQUESTS(packet *protocol.Packet) error {
	packet.Session.Logger.Debug("handleFRIENDLIST_GETFRIENDREQUESTS")
	return nil
}

func handleFOLLOW_FRIEND(packet *protocol.Packet) error {
	packet.Session.Logger.Debug("handleFOLLOW_FRIEND")
	return nil
}

func serializeCategories(categories []virtual.FriendListCategory) []io.WriterTo {
	var args []io.WriterTo
	args = append(args, protocol.Int(len(categories)))
	for _, category := range categories {
		args = append(args, protocol.Int(category.ID), protocol.String(category.Name))
	}
	return args
}

func serializeFriends(friends []virtual.Friend) []io.WriterTo {
	var args []io.WriterTo
	args = append(args, protocol.Int(len(friends)))
	for _, friend := range friends {
		args = append(
			args,
			protocol.Int(friend.ID),
			protocol.String(friend.Name),
			protocol.Int(friend.Sex),
			protocol.Int(friend.Online),
			protocol.Int(friend.CanFollow),
			protocol.String(friend.Figure),
			protocol.Int(friend.CategoryID),
			protocol.String(friend.Mission),
			protocol.String(friend.LastAccess),
		)
	}
	return args
}

func serializeUpdateFriends(friends []virtual.Friend, updateType int) []io.WriterTo {
	var args []io.WriterTo
	args = append(args, protocol.Int(len(friends)))
	for _, friend := range friends {
		args = append(
			args,
			protocol.Int(updateType),
			protocol.Int(friend.ID),
			protocol.String(friend.Name),
			protocol.Int(friend.Sex),
			protocol.Int(friend.Online),
			protocol.Int(friend.CanFollow),
			protocol.String(friend.Figure),
			protocol.Int(friend.CategoryID),
			protocol.String(friend.Mission),
			protocol.String(friend.LastAccess),
		)
	}
	return args
}
