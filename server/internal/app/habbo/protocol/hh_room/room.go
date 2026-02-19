package hhroom

import (
	"errors"
	"log/slog"
	"strings"

	"github.com/kronothepenguin/project-reborn/internal/app/habbo/protocol"
)

const DISCONNECT = "DISCONNECT"
const CLC = "CLC"
const OPC_OK = "OPC_OK"
const USERS = "USERS"
const LOGOUT = "LOGOUT"
const OBJECTS = "OBJECTS"
const HEIGHTMAP = "HEIGHTMAP"
const ACTIVEOBJECTS = "ACTIVEOBJECTS"
const ERROR = "ERROR"
const STATUS = "STATUS"
const FLAT_LETIN = "FLAT_LETIN"
const ITEMS = "ITEMS"
const ROOM_RIGHTS = "ROOM_RIGHTS"
const ROOM_RIGHTS_2 = "ROOM_RIGHTS_2"
const FLATPROPERTY = "FLATPROPERTY"
const ROOM_RIGHTS_3 = "ROOM_RIGHTS_3"
const IDATA = "IDATA"
const DOORFLAT = "DOORFLAT"
const DOORDELETED = "DOORDELETED"
const DOORDELETED_2 = "DOORDELETED_2"
const ROOM_READY = "ROOM_READY"
const YOUAREMOD = "YOUAREMOD"
const SHOWPROGRAM = "SHOWPROGRAM"
const NO_USER_FOR_GIFT = "NO_USER_FOR_GIFT"
const ITEMS_2 = "ITEMS_2"
const REMOVEITEM = "REMOVEITEM"
const UPDATEITEM = "UPDATEITEM"
const STUFFDATAUPDATE = "STUFFDATAUPDATE"
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
	registry.Commands().Register(ACTIVEOBJECTS, 32)
	registry.Commands().Register(ERROR, 33)
	registry.Commands().Register(STATUS, 34)
	registry.Commands().Register(FLAT_LETIN, 41)
	registry.Commands().Register(ITEMS, 45)
	registry.Commands().Register(ROOM_RIGHTS, 42)
	registry.Commands().Register(ROOM_RIGHTS_2, 43)
	registry.Commands().Register(FLATPROPERTY, 46)
	registry.Commands().Register(ROOM_RIGHTS_3, 47)
	registry.Commands().Register(IDATA, 48)
	registry.Commands().Register(DOORFLAT, 62)
	registry.Commands().Register(DOORDELETED, 63)
	registry.Commands().Register(DOORDELETED_2, 64)
	registry.Commands().Register(ROOM_READY, 69)
	registry.Commands().Register(YOUAREMOD, 70)
	registry.Commands().Register(SHOWPROGRAM, 71)
	registry.Commands().Register(NO_USER_FOR_GIFT, 76)
	registry.Commands().Register(ITEMS_2, 83)
	registry.Commands().Register(REMOVEITEM, 84)
	registry.Commands().Register(UPDATEITEM, 85)
	registry.Commands().Register(STUFFDATAUPDATE, 88)
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
	registry.Listeners().Register(28, handleGETDOORFLAT)
	registry.Listeners().Register(52, handleCHAT)
	registry.Listeners().Register(55, handleSHOUT)
	registry.Listeners().Register(56, handleWHISPER)
	registry.Listeners().Register(53, handleQUIT)
	registry.Listeners().Register(54, handleGOVIADOOR)
	registry.Listeners().Register(57, handleTRYFLAT)
	registry.Listeners().Register(59, handleGOTOFLAT)
	registry.Listeners().Register(60, handleGetHeightMap)
	registry.Listeners().Register(61, handleGetUsers)
	registry.Listeners().Register(62, handleGetObjects)
	registry.Listeners().Register(63, handleG_ITEMS)
	registry.Listeners().Register(64, handleG_STAT)
	registry.Listeners().Register(65, handleGETSTRIP)
	registry.Listeners().Register(66, handleFLATPROPBYITEM)
	registry.Listeners().Register(67, handleADDSTRIPITEM)
	registry.Listeners().Register(68, handleTRADE_UNACCEPT)
	registry.Listeners().Register(69, handleTRADE_ACCEPT)
	registry.Listeners().Register(70, handleTRADE_CLOSE)
	registry.Listeners().Register(71, handleTRADE_OPEN)
	registry.Listeners().Register(72, handleTRADE_ADDITEM)
	registry.Listeners().Register(73, handleMOVESTUFF)
	registry.Listeners().Register(74, handleSETSTUFFDATA)
	registry.Listeners().Register(75, handleMOVE)
	registry.Listeners().Register(76, handleTHROW_DICE)
	registry.Listeners().Register(77, handleDICE_OFF)
	registry.Listeners().Register(78, handlePRESENTOPEN)
	registry.Listeners().Register(79, handleLOOKTO)
	registry.Listeners().Register(80, handleCARRYDRINK)
	registry.Listeners().Register(81, handleINTODOOR)
	registry.Listeners().Register(82, handleDOORGOIN)
	registry.Listeners().Register(83, handleG_IDATA)
	registry.Listeners().Register(84, handleSETITEMDATA)
	registry.Listeners().Register(85, handleREMOVEITEM)
	registry.Listeners().Register(87, handleCARRYITEM)
	registry.Listeners().Register(88, handleStop)
	registry.Listeners().Register(89, handleUSEITEM)
	registry.Listeners().Register(90, handlePLACESTUFF)
	registry.Listeners().Register(93, handleDANCE)
	registry.Listeners().Register(94, handleWAVE)
	registry.Listeners().Register(95, handleKICKUSER)
	registry.Listeners().Register(96, handleASSIGNRIGHTS)
	registry.Listeners().Register(97, handleREMOVERIGHTS)
	registry.Listeners().Register(98, handleLETUSERIN)
	registry.Listeners().Register(99, handleREMOVESTUFF)
	registry.Listeners().Register(115, handleGOAWAY)
	registry.Listeners().Register(126, handleGetRoomAd)
	registry.Listeners().Register(128, handleGETPETSTAT)
	registry.Listeners().Register(158, handleSETBADGE)
	registry.Listeners().Register(182, handleGetInterstitial)
	registry.Listeners().Register(183, handleCONVERT_FURNI_TO_CREDITS)
	registry.Listeners().Register(211, handleROOM_QUEUE_CHANGE)
	registry.Listeners().Register(214, handleSETITEMSTATE)
	registry.Listeners().Register(216, handleGET_SPECTATOR_AMOUNT)
	registry.Listeners().Register(230, handleGET_GROUP_BADGES)
	registry.Listeners().Register(231, handleGET_GROUP_DETAILS)
	registry.Listeners().Register(247, handleSPIN_WHEEL_OF_FORTUNE)
	registry.Listeners().Register(261, handleRATEFLAT)
	registry.Listeners().Register(263, handleGET_USER_TAGS)
	registry.Listeners().Register(314, handleSET_RANDOM_STATE)
	registry.Listeners().Register(317, handleUSER_START_TYPING)
	registry.Listeners().Register(318, handleUSER_CANCEL_TYPING)
	registry.Listeners().Register(319, handleIGNOREUSER)
	registry.Listeners().Register(320, handleBANUSER)
	registry.Listeners().Register(321, handleGET_IGNORE_LIST)
	registry.Listeners().Register(322, handleUNIGNORE_USER)
	registry.Listeners().Register(345, handleCAN_CREATE_ROOMEVENT)
	registry.Listeners().Register(346, handleCREATE_ROOMEVENT)
	registry.Listeners().Register(347, handleQUIT_ROOMEVENT)
	registry.Listeners().Register(348, handleEDIT_ROOMEVENT)
	registry.Listeners().Register(349, handleGET_ROOMEVENT_TYPE_COUNT)
	registry.Listeners().Register(350, handleGET_ROOMEVENTS_BY_TYPE)
}

// #room_directory
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

	packet.Context.Logger().Debug(
		"handleRoomDirectory",
		slog.Bool("isPublic", isPublic),
		slog.Int("roomID", roomID),
		slog.Int("doorID", doorID),
	)

	var errs []error

	errs = append(errs, packet.Context.Send(OPC_OK)) // ??? from Holograph
	if doorID == 0 {
		// TODO: not allowed to enter locked rooms or room is full
		// 1: tError = "nav_error_room_full"
		// 2: tError = "nav_error_room_closed"
		// 3: tError = "queue_set." & tConn.GetStrFrom() & ".alert"
		// 4: tError = "nav_room_banned"
		// packet.Context.Send("CANTCONNECT", protocol.Int())
		// packet.Context.Send("SYSTEMBROADCAST") // Looks like not needed at all
	}

	if isPublic {
		errs = append(errs, packet.Context.Send(ROOM_READY, protocol.RawString("ballroom"))) // marker e.han. ballroom.room
	}

	return errors.Join(errs...)
}

func handleGETDOORFLAT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGETDOORFLAT")
	return nil
}

func handleCHAT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleCHAT")
	return nil
}

func handleSHOUT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSHOUT")
	return nil
}

func handleWHISPER(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleWHISPER")
	return nil
}

func handleQUIT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleQUIT")
	return nil
}

func handleGOVIADOOR(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGOVIADOOR")
	return nil
}

func handleTRYFLAT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleTRYFLAT")
	return nil
}

func handleGOTOFLAT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGOTOFLAT")
	return nil
}

// G_HMAP
func handleGetHeightMap(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGetHeightMap")

	var hmap strings.Builder
	hmap.WriteString("xxxxxxxxxxxxxxxxxxxxxxxx\r")
	hmap.WriteString("xxxx5555555555555555555x\r")
	hmap.WriteString("xxxx5555555555555555555x\r")
	hmap.WriteString("xxxx5555555555555555555x\r")
	hmap.WriteString("xxxxDDD3333555553333DDDx\r")
	hmap.WriteString("xxxxCCC3333333333333CCCx\r")
	hmap.WriteString("xxxx3333333000003333333x\r")
	hmap.WriteString("xxxx3333333000003333333x\r")
	hmap.WriteString("xxxxBBBxxxx00000xxxxBBBx\r")
	hmap.WriteString("xxxxAAA0000000000000AAAx\r")
	hmap.WriteString("00000000000000000000000x\r")
	hmap.WriteString("00000000000000000000000x\r")
	hmap.WriteString("00000000000000000000000x\r")
	hmap.WriteString("00000000000000000000000x\r")
	hmap.WriteString("00000000000000000000000x\r")
	hmap.WriteString("00000000000000000000000x\r")
	hmap.WriteString("00000000000000000000000x\r")
	hmap.WriteString("00000000000000000000000x\r")
	hmap.WriteString("00000000000000000000000x\r")
	hmap.WriteString("xxxxx0000AAAAAAAAA0000xx\r")
	hmap.WriteString("xxxxxx0001111A111A000xxx\r")
	hmap.WriteString("xxxxxxx0011111111A00xxxx\r")
	hmap.WriteString("xxxxxxxx011111111A0xxxxx\r")
	hmap.WriteString("xxxxxxxxx11111111Axxxxxx\r")
	hmap.WriteString("xxxxxxxxxxxxxxxxxxxxxxxx\r")

	return packet.Context.Send(HEIGHTMAP, protocol.RawString(hmap.String()))
}

// G_USRS
func handleGetUsers(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGetUsers")

	var users strings.Builder
	users.WriteString("i:10\r")                                     // user id
	users.WriteString("n:$hname\r")                                 // name
	users.WriteString("f:hd-180-1.ch-876-62.lg-280-62.sh-300-62\r") // figure
	users.WriteString("l:2 2 1\r")                                  // x y h
	users.WriteString("c:$customData\r")                            // custom data
	users.WriteString("s:M\r")                                      // sex

	// users.WriteString("p:\r")                                       // pool?

	users.WriteString("b:1:ADM\r") // badges
	users.WriteString("a:10\r")    // web id

	// users.WriteString("g:1\r")     // group id
	// users.WriteString("t:0\r")     // group status

	users.WriteString("x:100\r") // xp?
	// TODO: much more properties at hh_room/Room Handler Class.ls:142

	return packet.Context.Send(USERS, protocol.RawString(users.String()))
}

// G_OBJS
func handleGetObjects(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGetObjects")

	return errors.Join(
		packet.Context.Send(OBJECTS, protocol.RawString("")),
		packet.Context.Send(ACTIVEOBJECTS, protocol.Int(0)),
	)
}

func handleG_ITEMS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleG_ITEMS")
	return nil
}

func handleG_STAT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleG_STAT")
	return nil
}

func handleGETSTRIP(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGETSTRIP")
	return nil
}

func handleFLATPROPBYITEM(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleFLATPROPBYITEM")
	return nil
}

func handleADDSTRIPITEM(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleADDSTRIPITEM")
	return nil
}

func handleTRADE_UNACCEPT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleTRADE_UNACCEPT")
	return nil
}

func handleTRADE_ACCEPT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleTRADE_ACCEPT")
	return nil
}

func handleTRADE_CLOSE(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleTRADE_CLOSE")
	return nil
}

func handleTRADE_OPEN(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleTRADE_OPEN")
	return nil
}

func handleTRADE_ADDITEM(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleTRADE_ADDITEM")
	return nil
}

func handleMOVESTUFF(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleMOVESTUFF")
	return nil
}

func handleSETSTUFFDATA(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSETSTUFFDATA")
	return nil
}

func handleMOVE(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleMOVE")
	return nil
}

func handleTHROW_DICE(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleTHROW_DICE")
	return nil
}

func handleDICE_OFF(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleDICE_OFF")
	return nil
}

func handlePRESENTOPEN(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handlePRESENTOPEN")
	return nil
}

func handleLOOKTO(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleLOOKTO")
	return nil
}

func handleCARRYDRINK(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleCARRYDRINK")
	return nil
}

func handleINTODOOR(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleINTODOOR")
	return nil
}

func handleDOORGOIN(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleDOORGOIN")
	return nil
}

func handleG_IDATA(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleG_IDATA")
	return nil
}

func handleSETITEMDATA(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSETITEMDATA")
	return nil
}

func handleREMOVEITEM(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleREMOVEITEM")
	return nil
}

func handleCARRYITEM(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleCARRYITEM")
	return nil
}

// STOP
func handleStop(packet *protocol.Packet) error {
	what := packet.Message.ReadRawString()

	packet.Context.Logger().Debug("handleStop", slog.String("what", what))

	return nil
}

func handleUSEITEM(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleUSEITEM")
	return nil
}

func handlePLACESTUFF(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handlePLACESTUFF")
	return nil
}

func handleDANCE(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleDANCE")
	return nil
}

func handleWAVE(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleWAVE")
	return nil
}

func handleKICKUSER(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleKICKUSER")
	return nil
}

func handleASSIGNRIGHTS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleASSIGNRIGHTS")
	return nil
}

func handleREMOVERIGHTS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleREMOVERIGHTS")
	return nil
}

func handleLETUSERIN(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleLETUSERIN")
	return nil
}

func handleREMOVESTUFF(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleREMOVESTUFF")
	return nil
}

func handleGOAWAY(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGOAWAY")
	return nil
}

// GETROOMAD
func handleGetRoomAd(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGetRoomAd")

	// Room ads raw"{src}\t{target}"
	return packet.Context.Send(ROOMAD, protocol.RawString(""))
}

func handleGETPETSTAT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGETPETSTAT")
	return nil
}

func handleSETBADGE(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSETBADGE")
	return nil
}

// GETINTERST
func handleGetInterstitial(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGetInterstitial")

	// Ads when entering a room raw"{src}\t{target}"
	return packet.Context.Send(INTERSTITIALDATA, protocol.RawString(""))
}

func handleCONVERT_FURNI_TO_CREDITS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleCONVERT_FURNI_TO_CREDITS")
	return nil
}

func handleROOM_QUEUE_CHANGE(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleROOM_QUEUE_CHANGE")
	return nil
}

func handleSETITEMSTATE(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSETITEMSTATE")
	return nil
}

func handleGET_SPECTATOR_AMOUNT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGET_SPECTATOR_AMOUNT")
	return nil
}

func handleGET_GROUP_BADGES(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGET_GROUP_BADGES")
	return nil
}

func handleGET_GROUP_DETAILS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGET_GROUP_DETAILS")
	return nil
}

func handleSPIN_WHEEL_OF_FORTUNE(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSPIN_WHEEL_OF_FORTUNE")
	return nil
}

func handleRATEFLAT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleRATEFLAT")
	return nil
}

func handleGET_USER_TAGS(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGET_USER_TAGS")
	return nil
}

func handleSET_RANDOM_STATE(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleSET_RANDOM_STATE")
	return nil
}

func handleUSER_START_TYPING(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleUSER_START_TYPING")
	return nil
}

func handleUSER_CANCEL_TYPING(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleUSER_CANCEL_TYPING")
	return nil
}

func handleIGNOREUSER(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleIGNOREUSER")
	return nil
}

func handleBANUSER(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleBANUSER")
	return nil
}

func handleGET_IGNORE_LIST(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGET_IGNORE_LIST")
	return nil
}

func handleUNIGNORE_USER(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleUNIGNORE_USER")
	return nil
}

func handleCAN_CREATE_ROOMEVENT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleCAN_CREATE_ROOMEVENT")
	return nil
}

func handleCREATE_ROOMEVENT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleCREATE_ROOMEVENT")
	return nil
}

func handleQUIT_ROOMEVENT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleQUIT_ROOMEVENT")
	return nil
}

func handleEDIT_ROOMEVENT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleEDIT_ROOMEVENT")
	return nil
}

func handleGET_ROOMEVENT_TYPE_COUNT(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGET_ROOMEVENT_TYPE_COUNT")
	return nil
}

func handleGET_ROOMEVENTS_BY_TYPE(packet *protocol.Packet) error {
	packet.Context.Logger().Debug("handleGET_ROOMEVENTS_BY_TYPE")
	return nil
}
