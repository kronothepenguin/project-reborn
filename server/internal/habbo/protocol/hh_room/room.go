package hhroom

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

const DISCONNECT = "DISCONNECT"
const CLC = "CLC"
const OPC_OK = "OPC_OK"
const USERS = "USERS"
const LOGOUT = "LOGOUT"
const OBJECTS = "OBJECTS"
const HEIGHTMAP = "HEIGHTMAP"
const ACTIVE_OBJECTS = "ACTIVE_OBJECTS"
const ERROR = "ERROR"
const STATUS = "STATUS"
const FLAT_LETIN = "FLAT_LETIN"
const ITEMS = "ITEMS"
const ROOM_RIGHTS_CONTROLLER = "ROOM_RIGHTS_CONTROLLER"
const ROOM_RIGHTS = "ROOM_RIGHTS"
const FLAT_PROPERTY = "FLAT_PROPERTY"
const ROOM_RIGHTS_OWNER = "ROOM_RIGHTS_OWNER"
const IDATA = "IDATA"
const DOOR_FLAT = "DOOR_FLAT"
const DOOR_DELETED = "DOOR_DELETED"
const DOOR_DELETED_2 = "DOOR_DELETED_2"
const ROOM_READY = "ROOM_READY"
const YOU_ARE_MOD = "YOU_ARE_MOD"
const SHOW_PROGRAM = "SHOW_PROGRAM"
const NO_USER_FOR_GIFT = "NO_USER_FOR_GIFT"
const ITEMS_2 = "ITEMS_2"
const REMOVE_ITEMS = "REMOVE_ITEMS"
const UPDATE_ITEMS = "UPDATE_ITEMS"
const STUFF_DATA_UPDATE = "STUFF_DATA_UPDATE"
const DOOR_OUT = "DOOR_OUT"
const DICE_VALUE = "DICE_VALUE"
const DOORBELL_RINGING = "DOORBELL_RINGING"
const DOOR_IN = "DOOR_IN"
const ACTIVEOBJECT_ADD = "ACTIVEOBJECT_ADD"
const ACTIVEOBJECT_REMOVE = "ACTIVEOBJECT_REMOVE"
const ACTIVEOBJECT_UPDATE = "ACTIVEOBJECT_UPDATE"
const STRIPINFO = "STRIPINFO"
const REMOVESTRIPITEM = "REMOVESTRIPITEM"
const STRIPUPDATED = "STRIPUPDATED"
const YOUARENOTALLOWED = "YOUARENOTALLOWED"
const OTHERNOTALLOWED = "OTHERNOTALLOWED"
const TRADE_COMPLETED = "TRADE_COMPLETED"
const TRADE_ITEMS = "TRADE_ITEMS"
const TRADE_ACCEPT = "TRADE_ACCEPT"
const TRADE_CLOSE = "TRADE_CLOSE"
const TRADE_COMPLETED_2 = "TRADE_COMPLETED_2"
const PRESENTOPEN = "PRESENTOPEN"
const FLATNOTALLOWEDTOENTER = "FLATNOTALLOWEDTOENTER"
const STRIPINFO_2 = "STRIPINFO_2"
const ROOMAD = "ROOMAD"
const PETSTAT = "PETSTAT"
const HEIGHTMAPUPDATE = "HEIGHTMAPUPDATE"
const USERBADGE = "USERBADGE"
const SLIDEOBJECTBUNDLE = "SLIDEOBJECTBUNDLE"
const INTERSTITIALDATA = "INTERSTITIALDATA"
const ROOMQUEUEDATA = "ROOMQUEUEDATA"
const YOUARESPECTATOR = "YOUARESPECTATOR"
const REMOVESPECS = "REMOVESPECS"
const FIGURE_CHANGE = "FIGURE_CHANGE"
const SPECTATOR_AMOUNT = "SPECTATOR_AMOUNT"
const GROUP_BADGES = "GROUP_BADGES"
const GROUP_MEMBERSHIP_UPDATE = "GROUP_MEMBERSHIP_UPDATE"
const GROUP_DETAILS = "GROUP_DETAILS"
const ROOM_RATING = "ROOM_RATING"
const USER_TAG_LIST = "USER_TAG_LIST"
const USER_TYPING_STATUS = "USER_TYPING_STATUS"
const HIGHLIGHT_USER = "HIGHLIGHT_USER"
const ROOMEVENT_PERMISSION = "ROOMEVENT_PERMISSION"
const ROOMEVENT_TYPES = "ROOMEVENT_TYPES"
const ROOMEVENT_LIST = "ROOMEVENT_LIST"
const ROOMEVENT_INFO = "ROOMEVENT_INFO"
const IGNORE_USER_RESULT = "IGNORE_USER_RESULT"
const IGNORE_LIST = "IGNORE_LIST"

func Register(registry protocol.Registry) {
	registry.Commands().Register(DISCONNECT, -1)
	registry.Commands().Register(CLC, 18)
	registry.Commands().Register(OPC_OK, 19)
	registry.Commands().Register(USERS, 28)
	registry.Commands().Register(LOGOUT, 29)
	registry.Commands().Register(OBJECTS, 30)
	registry.Commands().Register(HEIGHTMAP, 31)
	registry.Commands().Register(ACTIVE_OBJECTS, 32)
	registry.Commands().Register(ERROR, 33)
	registry.Commands().Register(STATUS, 34)
	registry.Commands().Register(FLAT_LETIN, 41)
	registry.Commands().Register(ITEMS, 45)
	registry.Commands().Register(ROOM_RIGHTS_CONTROLLER, 42)
	registry.Commands().Register(ROOM_RIGHTS, 43)
	registry.Commands().Register(FLAT_PROPERTY, 46)
	registry.Commands().Register(ROOM_RIGHTS_OWNER, 47)
	registry.Commands().Register(IDATA, 48)
	registry.Commands().Register(DOOR_FLAT, 62)
	registry.Commands().Register(DOOR_DELETED, 63)
	registry.Commands().Register(DOOR_DELETED_2, 64)
	registry.Commands().Register(ROOM_READY, 69)
	registry.Commands().Register(YOU_ARE_MOD, 70)
	registry.Commands().Register(SHOW_PROGRAM, 71)
	registry.Commands().Register(NO_USER_FOR_GIFT, 76)
	registry.Commands().Register(ITEMS_2, 83)
	registry.Commands().Register(REMOVE_ITEMS, 84)
	registry.Commands().Register(UPDATE_ITEMS, 85)
	registry.Commands().Register(STUFF_DATA_UPDATE, 88)
	registry.Commands().Register(DOOR_OUT, 89)
	registry.Commands().Register(DICE_VALUE, 90)
	registry.Commands().Register(DOORBELL_RINGING, 91)
	registry.Commands().Register(DOOR_IN, 92)
	registry.Commands().Register(ACTIVEOBJECT_ADD, 93)
	registry.Commands().Register(ACTIVEOBJECT_REMOVE, 94)
	registry.Commands().Register(ACTIVEOBJECT_UPDATE, 95)
	registry.Commands().Register(STRIPINFO, 98)
	registry.Commands().Register(REMOVESTRIPITEM, 99)
	registry.Commands().Register(STRIPUPDATED, 101)
	registry.Commands().Register(YOUARENOTALLOWED, 102)
	registry.Commands().Register(OTHERNOTALLOWED, 103)
	registry.Commands().Register(TRADE_COMPLETED, 105)
	registry.Commands().Register(TRADE_ITEMS, 108)
	registry.Commands().Register(TRADE_ACCEPT, 109)
	registry.Commands().Register(TRADE_CLOSE, 110)
	registry.Commands().Register(TRADE_COMPLETED_2, 112)
	registry.Commands().Register(PRESENTOPEN, 129)
	registry.Commands().Register(FLATNOTALLOWEDTOENTER, 131)
	registry.Commands().Register(STRIPINFO_2, 140)
	registry.Commands().Register(ROOMAD, 208)
	registry.Commands().Register(PETSTAT, 210)
	registry.Commands().Register(HEIGHTMAPUPDATE, 219)
	registry.Commands().Register(USERBADGE, 228)
	registry.Commands().Register(SLIDEOBJECTBUNDLE, 230)
	registry.Commands().Register(INTERSTITIALDATA, 258)
	registry.Commands().Register(ROOMQUEUEDATA, 259)
	registry.Commands().Register(YOUARESPECTATOR, 254)
	registry.Commands().Register(REMOVESPECS, 283)
	registry.Commands().Register(FIGURE_CHANGE, 266)
	registry.Commands().Register(SPECTATOR_AMOUNT, 298)
	registry.Commands().Register(GROUP_BADGES, 309)
	registry.Commands().Register(GROUP_MEMBERSHIP_UPDATE, 310)
	registry.Commands().Register(GROUP_DETAILS, 311)
	registry.Commands().Register(ROOM_RATING, 345)
	registry.Commands().Register(USER_TAG_LIST, 350)
	registry.Commands().Register(USER_TYPING_STATUS, 361)
	registry.Commands().Register(HIGHLIGHT_USER, 362)
	registry.Commands().Register(ROOMEVENT_PERMISSION, 367)
	registry.Commands().Register(ROOMEVENT_TYPES, 368)
	registry.Commands().Register(ROOMEVENT_LIST, 369)
	registry.Commands().Register(ROOMEVENT_INFO, 370)
	registry.Commands().Register(IGNORE_USER_RESULT, 419)
	registry.Commands().Register(IGNORE_LIST, 420)

	registry.Listeners().Register(2, handleRoomDirectory)
	registry.Listeners().Register(28, handleGetDoorFlat)
	registry.Listeners().Register(52, handleChat)
	// TODO: other packets
}

func handleRoomDirectory(packet *protocol.Packet) error {
	isPublic, err := packet.Message.ReadBool()
	if err != nil {
		return err
	}

	roomID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	doorID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}

	if doorID == 0 {
		// not a teleport?
	}

	// FIXME: REMOVE THIS
	if isPublic {
	}
	if roomID == 1 {
	}

	return nil
}

func handleGetDoorFlat(packet *protocol.Packet) error {
	teleID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}
	roomID := 0
	//TODO: verify teleport id
	return packet.Context.Send(DOOR_FLAT, protocol.Int(teleID), protocol.Int(roomID))
}

func handleChat(packet *protocol.Packet) error {
	chat, err := packet.Message.ReadString()
	if err != nil {
		return err
	}
	// TODO: broadcast chat
	if chat == "" {
	}
	return nil
}
