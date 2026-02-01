package hhroom

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

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

	registry.Listeners().Register(2, handleroom_directory)
	registry.Listeners().Register(28, handleGETDOORFLAT)
	registry.Listeners().Register(52, handleCHAT)
	registry.Listeners().Register(55, handleSHOUT)
	registry.Listeners().Register(56, handleWHISPER)
	registry.Listeners().Register(53, handleQUIT)
	registry.Listeners().Register(54, handleGOVIADOOR)
	registry.Listeners().Register(57, handleTRYFLAT)
	registry.Listeners().Register(59, handleGOTOFLAT)
	registry.Listeners().Register(60, handleG_HMAP)
	registry.Listeners().Register(61, handleG_USRS)
	registry.Listeners().Register(62, handleG_OBJS)
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
	registry.Listeners().Register(88, handleSTOP)
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
	registry.Listeners().Register(126, handleGETROOMAD)
	registry.Listeners().Register(128, handleGETPETSTAT)
	registry.Listeners().Register(158, handleSETBADGE)
	registry.Listeners().Register(182, handleGETINTERST)
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

func handleroom_directory(*protocol.Packet) error           { return nil }
func handleGETDOORFLAT(*protocol.Packet) error              { return nil }
func handleCHAT(*protocol.Packet) error                     { return nil }
func handleSHOUT(*protocol.Packet) error                    { return nil }
func handleWHISPER(*protocol.Packet) error                  { return nil }
func handleQUIT(*protocol.Packet) error                     { return nil }
func handleGOVIADOOR(*protocol.Packet) error                { return nil }
func handleTRYFLAT(*protocol.Packet) error                  { return nil }
func handleGOTOFLAT(*protocol.Packet) error                 { return nil }
func handleG_HMAP(*protocol.Packet) error                   { return nil }
func handleG_USRS(*protocol.Packet) error                   { return nil }
func handleG_OBJS(*protocol.Packet) error                   { return nil }
func handleG_ITEMS(*protocol.Packet) error                  { return nil }
func handleG_STAT(*protocol.Packet) error                   { return nil }
func handleGETSTRIP(*protocol.Packet) error                 { return nil }
func handleFLATPROPBYITEM(*protocol.Packet) error           { return nil }
func handleADDSTRIPITEM(*protocol.Packet) error             { return nil }
func handleTRADE_UNACCEPT(*protocol.Packet) error           { return nil }
func handleTRADE_ACCEPT(*protocol.Packet) error             { return nil }
func handleTRADE_CLOSE(*protocol.Packet) error              { return nil }
func handleTRADE_OPEN(*protocol.Packet) error               { return nil }
func handleTRADE_ADDITEM(*protocol.Packet) error            { return nil }
func handleMOVESTUFF(*protocol.Packet) error                { return nil }
func handleSETSTUFFDATA(*protocol.Packet) error             { return nil }
func handleMOVE(*protocol.Packet) error                     { return nil }
func handleTHROW_DICE(*protocol.Packet) error               { return nil }
func handleDICE_OFF(*protocol.Packet) error                 { return nil }
func handlePRESENTOPEN(*protocol.Packet) error              { return nil }
func handleLOOKTO(*protocol.Packet) error                   { return nil }
func handleCARRYDRINK(*protocol.Packet) error               { return nil }
func handleINTODOOR(*protocol.Packet) error                 { return nil }
func handleDOORGOIN(*protocol.Packet) error                 { return nil }
func handleG_IDATA(*protocol.Packet) error                  { return nil }
func handleSETITEMDATA(*protocol.Packet) error              { return nil }
func handleREMOVEITEM(*protocol.Packet) error               { return nil }
func handleCARRYITEM(*protocol.Packet) error                { return nil }
func handleSTOP(*protocol.Packet) error                     { return nil }
func handleUSEITEM(*protocol.Packet) error                  { return nil }
func handlePLACESTUFF(*protocol.Packet) error               { return nil }
func handleDANCE(*protocol.Packet) error                    { return nil }
func handleWAVE(*protocol.Packet) error                     { return nil }
func handleKICKUSER(*protocol.Packet) error                 { return nil }
func handleASSIGNRIGHTS(*protocol.Packet) error             { return nil }
func handleREMOVERIGHTS(*protocol.Packet) error             { return nil }
func handleLETUSERIN(*protocol.Packet) error                { return nil }
func handleREMOVESTUFF(*protocol.Packet) error              { return nil }
func handleGOAWAY(*protocol.Packet) error                   { return nil }
func handleGETROOMAD(*protocol.Packet) error                { return nil }
func handleGETPETSTAT(*protocol.Packet) error               { return nil }
func handleSETBADGE(*protocol.Packet) error                 { return nil }
func handleGETINTERST(*protocol.Packet) error               { return nil }
func handleCONVERT_FURNI_TO_CREDITS(*protocol.Packet) error { return nil }
func handleROOM_QUEUE_CHANGE(*protocol.Packet) error        { return nil }
func handleSETITEMSTATE(*protocol.Packet) error             { return nil }
func handleGET_SPECTATOR_AMOUNT(*protocol.Packet) error     { return nil }
func handleGET_GROUP_BADGES(*protocol.Packet) error         { return nil }
func handleGET_GROUP_DETAILS(*protocol.Packet) error        { return nil }
func handleSPIN_WHEEL_OF_FORTUNE(*protocol.Packet) error    { return nil }
func handleRATEFLAT(*protocol.Packet) error                 { return nil }
func handleGET_USER_TAGS(*protocol.Packet) error            { return nil }
func handleSET_RANDOM_STATE(*protocol.Packet) error         { return nil }
func handleUSER_START_TYPING(*protocol.Packet) error        { return nil }
func handleUSER_CANCEL_TYPING(*protocol.Packet) error       { return nil }
func handleIGNOREUSER(*protocol.Packet) error               { return nil }
func handleBANUSER(*protocol.Packet) error                  { return nil }
func handleGET_IGNORE_LIST(*protocol.Packet) error          { return nil }
func handleUNIGNORE_USER(*protocol.Packet) error            { return nil }
func handleCAN_CREATE_ROOMEVENT(*protocol.Packet) error     { return nil }
func handleCREATE_ROOMEVENT(*protocol.Packet) error         { return nil }
func handleQUIT_ROOMEVENT(*protocol.Packet) error           { return nil }
func handleEDIT_ROOMEVENT(*protocol.Packet) error           { return nil }
func handleGET_ROOMEVENT_TYPE_COUNT(*protocol.Packet) error { return nil }
func handleGET_ROOMEVENTS_BY_TYPE(*protocol.Packet) error   { return nil }
