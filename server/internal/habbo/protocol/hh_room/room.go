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
	registry.RegisterCommand(DISCONNECT, -1)
	registry.RegisterCommand(CLC, 18)
	registry.RegisterCommand(OPC_OK, 19)
	registry.RegisterCommand(USERS, 28)
	registry.RegisterCommand(LOGOUT, 29)
	registry.RegisterCommand(OBJECTS, 30)
	registry.RegisterCommand(HEIGHTMAP, 31)
	registry.RegisterCommand(ACTIVE_OBJECTS, 32)
	registry.RegisterCommand(ERROR, 33)
	registry.RegisterCommand(STATUS, 34)
	registry.RegisterCommand(FLAT_LETIN, 41)
	registry.RegisterCommand(ITEMS, 45)
	registry.RegisterCommand(ROOM_RIGHTS_CONTROLLER, 42)
	registry.RegisterCommand(ROOM_RIGHTS, 43)
	registry.RegisterCommand(FLAT_PROPERTY, 46)
	registry.RegisterCommand(ROOM_RIGHTS_OWNER, 47)
	registry.RegisterCommand(IDATA, 48)
	registry.RegisterCommand(DOOR_FLAT, 62)
	registry.RegisterCommand(DOOR_DELETED, 63)
	registry.RegisterCommand(DOOR_DELETED_2, 64)
	registry.RegisterCommand(ROOM_READY, 69)
	registry.RegisterCommand(YOU_ARE_MOD, 70)
	registry.RegisterCommand(SHOW_PROGRAM, 71)
	registry.RegisterCommand(NO_USER_FOR_GIFT, 76)
	registry.RegisterCommand(ITEMS_2, 83)
	registry.RegisterCommand(REMOVE_ITEMS, 84)
	registry.RegisterCommand(UPDATE_ITEMS, 85)
	registry.RegisterCommand(STUFF_DATA_UPDATE, 88)
	registry.RegisterCommand(DOOR_OUT, 89)
	registry.RegisterCommand(DICE_VALUE, 90)
	registry.RegisterCommand(DOORBELL_RINGING, 91)
	registry.RegisterCommand(DOOR_IN, 92)
	registry.RegisterCommand(ACTIVEOBJECT_ADD, 93)
	registry.RegisterCommand(ACTIVEOBJECT_REMOVE, 94)
	registry.RegisterCommand(ACTIVEOBJECT_UPDATE, 95)
	registry.RegisterCommand(STRIPINFO, 98)
	registry.RegisterCommand(REMOVESTRIPITEM, 99)
	registry.RegisterCommand(STRIPUPDATED, 101)
	registry.RegisterCommand(YOUARENOTALLOWED, 102)
	registry.RegisterCommand(OTHERNOTALLOWED, 103)
	registry.RegisterCommand(TRADE_COMPLETED, 105)
	registry.RegisterCommand(TRADE_ITEMS, 108)
	registry.RegisterCommand(TRADE_ACCEPT, 109)
	registry.RegisterCommand(TRADE_CLOSE, 110)
	registry.RegisterCommand(TRADE_COMPLETED_2, 112)
	registry.RegisterCommand(PRESENTOPEN, 129)
	registry.RegisterCommand(FLATNOTALLOWEDTOENTER, 131)
	registry.RegisterCommand(STRIPINFO_2, 140)
	registry.RegisterCommand(ROOMAD, 208)
	registry.RegisterCommand(PETSTAT, 210)
	registry.RegisterCommand(HEIGHTMAPUPDATE, 219)
	registry.RegisterCommand(USERBADGE, 228)
	registry.RegisterCommand(SLIDEOBJECTBUNDLE, 230)
	registry.RegisterCommand(INTERSTITIALDATA, 258)
	registry.RegisterCommand(ROOMQUEUEDATA, 259)
	registry.RegisterCommand(YOUARESPECTATOR, 254)
	registry.RegisterCommand(REMOVESPECS, 283)
	registry.RegisterCommand(FIGURE_CHANGE, 266)
	registry.RegisterCommand(SPECTATOR_AMOUNT, 298)
	registry.RegisterCommand(GROUP_BADGES, 309)
	registry.RegisterCommand(GROUP_MEMBERSHIP_UPDATE, 310)
	registry.RegisterCommand(GROUP_DETAILS, 311)
	registry.RegisterCommand(ROOM_RATING, 345)
	registry.RegisterCommand(USER_TAG_LIST, 350)
	registry.RegisterCommand(USER_TYPING_STATUS, 361)
	registry.RegisterCommand(HIGHLIGHT_USER, 362)
	registry.RegisterCommand(ROOMEVENT_PERMISSION, 367)
	registry.RegisterCommand(ROOMEVENT_TYPES, 368)
	registry.RegisterCommand(ROOMEVENT_LIST, 369)
	registry.RegisterCommand(ROOMEVENT_INFO, 370)
	registry.RegisterCommand(IGNORE_USER_RESULT, 419)
	registry.RegisterCommand(IGNORE_LIST, 420)

	registry.RegisterListener(2, handleRoomDirectory)
	registry.RegisterListener(28, handleGetDoorFlat)
	registry.RegisterListener(52, handleChat)
	// TODO: other packets
}

func handleRoomDirectory(ctx protocol.Context, packet *protocol.Packet) error {
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

func handleGetDoorFlat(ctx protocol.Context, packet *protocol.Packet) error {
	teleID, err := packet.Message.ReadInt()
	if err != nil {
		return err
	}
	roomID := 0
	//TODO: verify teleport id
	return ctx.Send(DOOR_FLAT, protocol.Int(teleID), protocol.Int(roomID))
}

func handleChat(ctx protocol.Context, packet *protocol.Packet) error {
	chat, err := packet.Message.ReadString()
	if err != nil {
		return err
	}
	// TODO: broadcast chat
	if chat == "" {
	}
	return nil
}
