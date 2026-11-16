package r26

import (
	"bytes"
	"context"
	"fmt"
	"log/slog"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/encoding"
	"github.com/kronothepenguin/project-reborn/packages/server/internal/game"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// The messages of hh_room the server sends (packages/server/knowledge/r26/hh_room.md), and hh_navigator's 224, which
// answers an entry.
const (
	clc                   = 18
	opcOK                 = 19
	roomUsers             = 28
	roomLogout            = 29
	roomObjects           = 30
	heightMap             = 31
	activeObjects         = 32
	roomStatus            = 34
	flatLetIn             = 41
	roomController        = 42
	roomNotController     = 43
	roomItems             = 45
	userBadge             = 228
	figureChange          = 266
	roomOwner             = 47
	roomReady             = 69
	doorbellRinging       = 91
	flatNotAllowedToEnter = 131
	roomAdData            = 208
	cantConnect           = 224
	youAreSpectator       = 254
	interstitialData      = 258
	roomQueueData         = 259
	removeSpecs           = 283
	spectatorAmount       = 298
	groupBadges           = 309
	groupDetails          = 311
	roomRating            = 345
	userTagList           = 350
	userTypingStatus      = 361
	roomEventPermission   = 367
	roomEventTypes        = 368
	roomEventList         = 369
	roomEventInfo         = 370
	ignoreUserResult      = 419
	ignoreList            = 420
)

// The reason of 224 for a ban, as hh_navigator shows it; a full room queues (decision server/0087).
const cantConnectBanned = 4

const incorrectFlatPassword = "Incorrect flat password"

// roomCommands names the commands of hh_room by id, as its Room Handler registers them.
var roomCommands = map[int]string{
	2:   "#room_directory",
	28:  "GETDOORFLAT",
	52:  "CHAT",
	53:  "QUIT",
	54:  "GOVIADOOR",
	55:  "SHOUT",
	56:  "WHISPER",
	57:  "TRYFLAT",
	59:  "GOTOFLAT",
	60:  "G_HMAP",
	61:  "G_USRS",
	62:  "G_OBJS",
	63:  "G_ITEMS",
	64:  "G_STAT",
	65:  "GETSTRIP",
	66:  "FLATPROPBYITEM",
	67:  "ADDSTRIPITEM",
	68:  "TRADE_UNACCEPT",
	69:  "TRADE_ACCEPT",
	70:  "TRADE_CLOSE",
	71:  "TRADE_OPEN",
	72:  "TRADE_ADDITEM",
	73:  "MOVESTUFF",
	74:  "SETSTUFFDATA",
	75:  "MOVE",
	76:  "THROW_DICE",
	77:  "DICE_OFF",
	78:  "PRESENTOPEN",
	79:  "LOOKTO",
	80:  "CARRYDRINK",
	81:  "INTODOOR",
	82:  "DOORGOIN",
	83:  "G_IDATA",
	84:  "SETITEMDATA",
	85:  "REMOVEITEM",
	87:  "CARRYITEM",
	88:  "STOP",
	89:  "USEITEM",
	90:  "PLACESTUFF",
	93:  "DANCE",
	94:  "WAVE",
	95:  "KICKUSER",
	96:  "ASSIGNRIGHTS",
	97:  "REMOVERIGHTS",
	98:  "LETUSERIN",
	99:  "REMOVESTUFF",
	115: "GOAWAY",
	126: "GETROOMAD",
	128: "GETPETSTAT",
	158: "SETBADGE",
	182: "GETINTERST",
	183: "CONVERT_FURNI_TO_CREDITS",
	211: "ROOM_QUEUE_CHANGE",
	214: "SETITEMSTATE",
	216: "GET_SPECTATOR_AMOUNT",
	230: "GET_GROUP_BADGES",
	231: "GET_GROUP_DETAILS",
	247: "SPIN_WHEEL_OF_FORTUNE",
	261: "RATEFLAT",
	263: "GET_USER_TAGS",
	314: "SET_RANDOM_STATE",
	317: "USER_START_TYPING",
	318: "USER_CANCEL_TYPING",
	319: "IGNOREUSER",
	320: "BANUSER",
	321: "GET_IGNORE_LIST",
	322: "UNIGNORE_USER",
	345: "CAN_CREATE_ROOMEVENT",
	346: "CREATE_ROOMEVENT",
	347: "QUIT_ROOMEVENT",
	348: "EDIT_ROOMEVENT",
	349: "GET_ROOMEVENT_TYPE_COUNT",
	350: "GET_ROOMEVENTS_BY_TYPE",
}

// roomHandlers handles hh_room's commands, which the client sends once its habbo is logged in.
var roomHandlers = map[int]handler{
	2:   loggedIn(handleRoomDirectory),
	28:  loggedIn(handleGetDoorFlat),
	53:  loggedIn(handleQuit),
	54:  loggedIn(handleGoViaDoor),
	57:  loggedIn(handleTryFlat),
	59:  loggedIn(handleGoToFlat),
	60:  loggedIn(handleGetHeightMap),
	61:  loggedIn(handleGetUsers),
	62:  loggedIn(handleGetObjects),
	63:  loggedIn(handleGetItems),
	64:  loggedIn(handleGetStatus),
	65:  loggedIn(handleGetStrip),
	66:  loggedIn(handleFlatPropByItem),
	67:  loggedIn(handleAddStripItem),
	68:  loggedIn(handleTradeUnaccept),
	69:  loggedIn(handleTradeAccept),
	70:  loggedIn(handleTradeClose),
	71:  loggedIn(handleTradeOpen),
	72:  loggedIn(handleTradeAddItem),
	73:  loggedIn(handleMoveStuff),
	74:  loggedIn(handleSetStuffData),
	76:  loggedIn(handleThrowDice),
	77:  loggedIn(handleDiceOff),
	75:  loggedIn(handleMove),
	78:  loggedIn(handlePresentOpen),
	79:  loggedIn(handleLookTo),
	80:  loggedIn(handleCarryDrink),
	81:  loggedIn(handleIntoDoor),
	82:  loggedIn(handleDoorGoIn),
	83:  loggedIn(handleGetItemData),
	84:  loggedIn(handleSetItemData),
	85:  loggedIn(handleRemoveItem),
	88:  loggedIn(handleStop),
	90:  loggedIn(handlePlaceStuff),
	158: loggedIn(handleSetBadge),
	93:  loggedIn(handleDance),
	94:  loggedIn(handleWave),
	95:  loggedIn(handleKickUser),
	96:  loggedIn(handleAssignRights),
	97:  loggedIn(handleRemoveRights),
	98:  loggedIn(handleLetUserIn),
	126: loggedIn(handleGetRoomAd),
	182: loggedIn(handleGetInterstitial),
	183: loggedIn(handleConvertFurniToCredits),
	211: loggedIn(handleRoomQueueChange),
	214: loggedIn(handleSetItemState),
	216: loggedIn(handleGetSpectatorAmount),
	317: loggedIn(handleStartTyping),
	318: loggedIn(handleCancelTyping),
	319: loggedIn(handleIgnoreUser),
	321: loggedIn(handleGetIgnoreList),
	230: loggedIn(handleGetGroupBadges),
	231: loggedIn(handleGetGroupDetails),
	247: loggedIn(handleSpinWheel),
	261: loggedIn(handleRateFlat),
	263: loggedIn(handleGetUserTags),
	314: loggedIn(handleSetRandomState),
	320: loggedIn(handleBanUser),
	322: loggedIn(handleUnignoreUser),
	345: loggedIn(handleCanCreateRoomEvent),
	346: loggedIn(handleCreateRoomEvent),
	347: loggedIn(handleQuitRoomEvent),
	348: loggedIn(handleEditRoomEvent),
	349: loggedIn(handleGetRoomEventTypeCount),
	350: loggedIn(handleGetRoomEventsByType),
}

// handleRoomDirectory heads the habbo for a room, out of the one it is in: 19, which Holo sent for both kinds, then a
// public room's 69 with its model as the marker, or its queue's 259 when it is full. A habbo room goes on with
// TRYFLAT.
// The public room's door, the third field, is the model's own.
func handleRoomDirectory(s *session, me habbo.Habbo, body []byte) {
	r := bytes.NewReader(body)
	public, err := encoding.ReadBool(r)
	if err != nil {
		s.malformed(2, body)
		return
	}
	id, err := encoding.ReadVL64(r)
	if err != nil {
		s.malformed(2, body)
		return
	}
	s.reply(opcOK, nil)
	ref := room.Ref{Public: public, ID: int64(id)}
	a, m, err := game.ChooseRoom(context.Background(), s.db, me, ref)
	if err != nil {
		s.fail(err)
		return
	}
	if a == game.Admitted {
		s.reply(roomReady, []byte(m.Name+" "+strconv.FormatInt(ref.ID, 10)))
	}
}

// handleTryFlat answers the habbo at the door of the habbo room it chose: 41 lets it in, and the client goes on with
// GOTOFLAT; 91 keeps it at the doorbell; 131 turns it away when nobody can answer; 33 Incorrect flat password; 224
// with 4 for a ban; and a full room's queue, 259.
func handleTryFlat(s *session, me habbo.Habbo, body []byte) {
	text, err := encoding.ReadRaw(bytes.NewReader(body))
	if err != nil {
		s.malformed(57, body)
		return
	}
	idText, password, _ := strings.Cut(text, "/")
	id, err := strconv.ParseInt(idText, 10, 64)
	if err != nil {
		s.malformed(57, body)
		return
	}
	a, err := game.TryFlat(context.Background(), s.db, me, id, password)
	if err != nil {
		s.fail(err)
		return
	}
	switch a {
	case game.Admitted:
		s.reply(flatLetIn, str(""))
	case game.Ringing:
		s.reply(doorbellRinging, nil)
	case game.NoAnswer:
		s.reply(flatNotAllowedToEnter, str(""))
	case game.WrongPassword:
		s.reply(errorText, []byte(incorrectFlatPassword))
	case game.Banned:
		s.reply(cantConnect, vl64(cantConnectBanned))
	}
}

// handleGoToFlat takes the habbo into the habbo room whose door let it through: 69 with model_<model> as the marker,
// then 47 for its owner and 42 for a habbo with rights, the room's rating, 345, and its event, 370, as Holo sent them.
func handleGoToFlat(s *session, me habbo.Habbo, body []byte) {
	id, ok := flatID(body)
	if !ok {
		s.malformed(59, body)
		return
	}
	e, ok, err := game.GoToFlat(context.Background(), s.db, me, id)
	if err != nil {
		s.fail(err)
		return
	}
	if !ok {
		return
	}
	s.reply(roomReady, []byte("model_"+e.Model+" "+strconv.FormatInt(id, 10)))
	// The room's decorations, in Holo's order; a room that was never decorated shows its model's own.
	for _, property := range [][2]string{{"landscape", e.Landscape}, {"wallpaper", e.Wallpaper}, {"floor", e.Floor}} {
		if property[1] != "" {
			s.reply(flatProperty, []byte(property[0]+"/"+property[1]))
		}
	}
	if e.Owner {
		s.reply(roomOwner, nil)
	}
	if e.Rights {
		s.reply(roomController, nil)
	}
	rating, err := game.RoomRating(context.Background(), s.db, me, id)
	if err != nil {
		s.fail(err)
		return
	}
	s.sendRating(rating)
	event, held := game.RoomEvent(id)
	s.sendRoomEvent(game.RoomEventChanged{Event: event, Held: held})
}

func flatID(body []byte) (int64, bool) {
	text, err := encoding.ReadRaw(bytes.NewReader(body))
	if err != nil {
		return 0, false
	}
	id, err := strconv.ParseInt(text, 10, 64)
	return id, err == nil
}

// handleGetHeightMap sends the height map of the room the habbo arrives in, a row per line.
func handleGetHeightMap(s *session, me habbo.Habbo, _ []byte) {
	_, m, ok, err := game.Arrival(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	if ok {
		s.reply(heightMap, []byte(strings.ReplaceAll(m.Heightmap, "\n", "\r")))
	}
}

// handleGetUsers sends the habbos in the room the habbo arrives in, which it is not in yet.
func handleGetUsers(s *session, me habbo.Habbo, _ []byte) {
	visitors, ok, err := game.Visitors(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	if !ok {
		return
	}
	var b strings.Builder
	for _, v := range visitors {
		writeUser(&b, v)
	}
	s.reply(roomUsers, []byte(b.String()))
}

// handleGetObjects sends the room's public furni, and the floor furni that stands in it. Nothing asks for the floor
// furni, 32, which the client needs to build the room, so it follows the public furni, as Holo sent it.
func handleGetObjects(s *session, me habbo.Habbo, _ []byte) {
	_, m, ok, err := game.Arrival(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	if !ok {
		return
	}
	items, _, err := game.RoomFurni(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	var b strings.Builder
	for line := range strings.SplitSeq(m.PublicItems, "\n") {
		if fields := strings.Fields(line); len(fields) >= 6 {
			b.WriteString(strings.Join(fields[:6], " ") + "\r")
		}
	}
	s.reply(roomObjects, []byte(b.String()))
	s.reply(activeObjects, activeObjectsBody(items))
}

// handleGetItems sends the wall items of the room the habbo arrives in.
func handleGetItems(s *session, me habbo.Habbo, _ []byte) {
	if items, ok, err := game.RoomFurni(context.Background(), s.db, me); err != nil {
		s.fail(err)
	} else if ok {
		s.reply(roomItems, []byte(wallItemLines(items)))
	}
}

// handleGetStatus brings the habbo into the room it built: it gets the others' statuses, then its own user line and
// status, which the others get too, as Holo sent them. A room that filled meanwhile queues it, and a spectator gets the
// statuses alone.
func handleGetStatus(s *session, me habbo.Habbo, _ []byte) {
	visitors, a, err := game.EnterRoom(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	switch a {
	case game.InQueue, game.NoRoom:
		return
	case game.Watching:
		var b strings.Builder
		for _, v := range visitors {
			writeStatus(&b, v.Occupant)
		}
		s.reply(roomStatus, []byte(b.String()))
		return
	}
	var others strings.Builder
	var self game.Visitor
	for _, v := range visitors {
		if v.Habbo.ID == me.ID {
			self = v
			continue
		}
		writeStatus(&others, v.Occupant)
	}
	s.reply(roomStatus, []byte(others.String()))
	s.sendEntered(self)
}

func (s *session) sendEntered(v game.Visitor) {
	var b strings.Builder
	writeUser(&b, v)
	s.reply(roomUsers, []byte(b.String()))
	b.Reset()
	writeStatus(&b, v.Occupant)
	s.reply(roomStatus, []byte(b.String()))
}

// handleQuit takes the habbo out of its room.
func handleQuit(s *session, me habbo.Habbo, _ []byte) {
	game.LeaveRoom(me.ID, s)
}

// handleMove sends the habbo walking to a tile of its room, two B64 shorts.
func handleMove(s *session, me habbo.Habbo, body []byte) {
	r := bytes.NewReader(body)
	x, err := encoding.ReadB64(r, 2)
	if err != nil {
		s.malformed(75, body)
		return
	}
	y, err := encoding.ReadB64(r, 2)
	if err != nil {
		s.malformed(75, body)
		return
	}
	game.Walk(me, x, y)
}

// handleLookTo turns the habbo to a tile, `<x> <y>`.
func handleLookTo(s *session, me habbo.Habbo, body []byte) {
	text, err := encoding.ReadRaw(bytes.NewReader(body))
	if err != nil {
		s.malformed(79, body)
		return
	}
	xText, yText, _ := strings.Cut(text, " ")
	x, errX := strconv.Atoi(xText)
	y, errY := strconv.Atoi(yText)
	if errX != nil || errY != nil {
		s.malformed(79, body)
		return
	}
	game.LookTo(me, x, y)
}

// handleStartTyping and handleCancelTyping tell the room that the habbo types, as 361.
func handleStartTyping(_ *session, me habbo.Habbo, _ []byte)  { game.SetTyping(me, true) }
func handleCancelTyping(_ *session, me habbo.Habbo, _ []byte) { game.SetTyping(me, false) }

// handleDance starts the normal dance with no body, or a club dance, 1 to 4.
func handleDance(s *session, me habbo.Habbo, body []byte) {
	if len(body) == 0 {
		game.Dance(me, 0)
		return
	}
	dance, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(93, body)
		return
	}
	game.Dance(me, int(dance))
}

// handleWave makes the habbo wave.
func handleWave(_ *session, me habbo.Habbo, _ []byte) { game.Wave(me) }

// handleStop ends the habbo's dance, `Dance`; carrying, `CarryItem`, comes with drinks.
func handleStop(_ *session, me habbo.Habbo, body []byte) {
	switch string(body) {
	case "Dance":
		game.StopDancing(me)
	case "CarryItem":
		game.DropDrink(me)
	}
}

// handleIgnoreUser and handleUnignoreUser answer 419 with what the ignore did: 0 failed, 1 added, 2 added with the
// oldest dropped, 3 removed, as the client's ignore list reads them.
func handleIgnoreUser(s *session, me habbo.Habbo, body []byte) {
	ignoreBy(s, 319, body, func(name string) (game.IgnoreResult, error) {
		return game.Ignore(context.Background(), s.db, me, name)
	})
}

func handleUnignoreUser(s *session, me habbo.Habbo, body []byte) {
	ignoreBy(s, 322, body, func(name string) (game.IgnoreResult, error) {
		return game.Unignore(context.Background(), s.db, me, name)
	})
}

func ignoreBy(s *session, id int, body []byte, rule func(name string) (game.IgnoreResult, error)) {
	name, err := encoding.ReadB64String(bytes.NewReader(body))
	if err != nil {
		s.malformed(id, body)
		return
	}
	result, err := rule(name)
	if err != nil {
		s.fail(err)
		return
	}
	s.reply(ignoreUserResult, vl64(int(result)))
}

// handleGetIgnoreList sends 420: the names of the habbos the habbo ignores.
func handleGetIgnoreList(s *session, me habbo.Habbo, _ []byte) {
	names, err := game.IgnoreList(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	b := vl64(len(names))
	for _, name := range names {
		b = append(b, str(name)...)
	}
	s.reply(ignoreList, b)
}

// handleKickUser sends a habbo of the room, named by the body, walking out (decision server/0079).
func handleKickUser(s *session, me habbo.Habbo, body []byte) {
	if name, ok := rawName(s, 95, body); ok {
		game.Kick(me, name)
	}
}

// handleBanUser bans a habbo of the room for game.roomBanMinutes and sends it walking out.
func handleBanUser(s *session, me habbo.Habbo, body []byte) {
	if name, ok := rawName(s, 320, body); ok {
		s.ruled(game.Ban(context.Background(), s.db, me, name))
	}
}

// handleAssignRights and handleRemoveRights give and take a habbo's rights in the owner's room: the habbo gets 42 or
// 43.
func handleAssignRights(s *session, me habbo.Habbo, body []byte) {
	if name, ok := rawName(s, 96, body); ok {
		s.ruled(game.AssignRights(context.Background(), s.db, me, name))
	}
}

func handleRemoveRights(s *session, me habbo.Habbo, body []byte) {
	if name, ok := rawName(s, 97, body); ok {
		s.ruled(game.RemoveRights(context.Background(), s.db, me, name))
	}
}

func rawName(s *session, id int, body []byte) (string, bool) {
	name, err := encoding.ReadRaw(bytes.NewReader(body))
	if err != nil {
		s.malformed(id, body)
		return "", false
	}
	return name, true
}

// handleLetUserIn answers the doorbell of the habbo's room.
func handleLetUserIn(s *session, me habbo.Habbo, body []byte) {
	r := bytes.NewReader(body)
	name, err := encoding.ReadB64String(r)
	if err != nil {
		s.malformed(98, body)
		return
	}
	letIn, err := encoding.ReadBool(r)
	if err != nil {
		s.malformed(98, body)
		return
	}
	game.AnswerDoorbell(me, name, letIn)
}

// handleGetInterstitial sends the ad shown while a room loads (decision server/0070).
func handleGetInterstitial(s *session, _ habbo.Habbo, _ []byte) {
	s.reply(interstitialData, ad("game.loadingAdImage", "game.loadingAdLink"))
}

// handleGetRoomAd sends the ad shown in a room (decision server/0070).
func handleGetRoomAd(s *session, _ habbo.Habbo, _ []byte) {
	s.reply(roomAdData, ad("game.roomAdImage", "game.roomAdLink"))
}

// ad writes an ad as 258 and 208 carry it: the image and the link, separated by a tab, or 0, a body of one character,
// which shows none, as Holo sent it.
func ad(imageKey, linkKey string) []byte {
	image := settings.GetString(imageKey)
	if image == "" {
		return []byte("0")
	}
	return []byte(image + "\t" + settings.GetString(linkKey))
}

// writeUser writes a habbo's user lines, in the order Holo wrote them: its index, web id, name, figure, place, motto,
// sex and badges, `<slot>:<code>` for each badge it wears, comma-separated, then its favourite group and its status in
// it, when it has one. Each line ends with a carriage return, which ends a line for the client,
// so none may hold one.
func writeUser(b *strings.Builder, v game.Visitor) {
	var worn []string
	for i, code := range v.Habbo.Worn {
		if code != "" {
			worn = append(worn, strconv.Itoa(i+1)+":"+code)
		}
	}
	badges := strings.Join(worn, ",")
	o := v.Occupant
	for _, line := range []string{
		"i:" + strconv.Itoa(o.Index),
		"a:" + strconv.FormatInt(v.Habbo.ID, 10),
		"n:" + v.Habbo.Name,
		"f:" + v.Habbo.Figure,
		fmt.Sprintf("l:%d %d %s", o.X, o.Y, height(o.Height)),
		"c:" + v.Habbo.Motto,
		"s:" + v.Habbo.Gender,
		"b:" + badges,
	} {
		b.WriteString(strings.ReplaceAll(line, "\r", " "))
		b.WriteByte('\r')
	}
	if g := v.Habbo.Group; g.ID != 0 {
		fmt.Fprintf(b, "g:%d\rt:%d\r", g.ID, g.Status)
	}
}

// writeStatus writes a habbo's status line: its index, place and directions, head first, then each action and its
// parameters, each followed by a slash, as Holo wrote them.
func writeStatus(b *strings.Builder, o room.Occupant) {
	fmt.Fprintf(b, "%d %d,%d,%s,%d,%d/", o.Index, o.X, o.Y, height(o.Height), o.HeadDirection, o.BodyDirection)
	for _, st := range o.Statuses {
		b.WriteString(st.Action)
		if st.Parameters != "" {
			b.WriteString(" " + st.Parameters)
		}
		b.WriteByte('/')
	}
	b.WriteByte('\r')
}

func height(h float64) string {
	return strconv.FormatFloat(h, 'f', -1, 64)
}

// str writes s as a string the client's GetStrFrom reads.
func str(s string) []byte {
	var b bytes.Buffer
	// A string that cannot be encoded holds the character 2 or is not UTF-8; names and empty strings never are.
	_ = encoding.WriteString(&b, s)
	return b.Bytes()
}

// handleRateFlat records the habbo's vote, 1 or -1, on its room.
func handleRateFlat(s *session, me habbo.Habbo, body []byte) {
	vote, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(261, body)
		return
	}
	s.ruled(game.RateRoom(context.Background(), s.db, me, int(vote)))
}

// sendRating writes a rating as 345: the rating, -1 before the habbo votes, and the share of +1 votes.
func (s *session) sendRating(r game.Rating) {
	s.reply(roomRating, append(vl64(r.Value), vl64(r.Percent)...))
}

// handleCanCreateRoomEvent answers 367: 1 when the habbo may host an event where it is.
func handleCanCreateRoomEvent(s *session, me habbo.Habbo, _ []byte) {
	s.reply(roomEventPermission, vl64(flag(game.CanHostEvent(me))))
}

func handleCreateRoomEvent(s *session, me habbo.Habbo, body []byte) {
	roomEvent(s, me, 346, body, false)
}
func handleEditRoomEvent(s *session, me habbo.Habbo, body []byte) { roomEvent(s, me, 348, body, true) }

// roomEvent reads an event, its type, name and description, and hosts or changes it.
func roomEvent(s *session, me habbo.Habbo, id int, body []byte, edit bool) {
	r := bytes.NewReader(body)
	eventType, err := encoding.ReadVL64(r)
	if err != nil {
		s.malformed(id, body)
		return
	}
	name, err := encoding.ReadB64String(r)
	if err != nil {
		s.malformed(id, body)
		return
	}
	description, err := encoding.ReadB64String(r)
	if err != nil {
		s.malformed(id, body)
		return
	}
	game.HostEvent(me, int(eventType), name, description, edit)
}

// handleQuitRoomEvent ends the event the habbo hosts.
func handleQuitRoomEvent(_ *session, me habbo.Habbo, _ []byte) { game.EndEvent(me) }

// handleGetRoomEventTypeCount answers 368 with how many event types there are.
func handleGetRoomEventTypeCount(s *session, _ habbo.Habbo, _ []byte) {
	s.reply(roomEventTypes, vl64(game.EventTypes()))
}

// handleGetRoomEventsByType answers 369 with the events of a type: each one's room, host, name, description and
// start.
func handleGetRoomEventsByType(s *session, _ habbo.Habbo, body []byte) {
	eventType, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(350, body)
		return
	}
	events := game.Events(int(eventType))
	b := append(vl64(int(eventType)), vl64(len(events))...)
	for _, e := range events {
		for _, field := range []string{strconv.FormatInt(e.FlatID, 10), e.HostName, e.Name, e.Description, game.EventTime(e.Event)} {
			b = append(b, str(field)...)
		}
	}
	s.reply(roomEventList, b)
}

// sendRoomEvent writes a room's event as 370: its host's id, -1 when it has none; then the host's name, the room, the
// type, the name, the description and the start.
func (s *session) sendRoomEvent(c game.RoomEventChanged) {
	if !c.Held {
		s.reply(roomEventInfo, str("-1"))
		return
	}
	e := c.Event
	b := append(str(strconv.FormatInt(e.HostID, 10)), str(e.HostName)...)
	b = append(b, str(strconv.FormatInt(e.FlatID, 10))...)
	b = append(b, vl64(e.Type)...)
	for _, field := range []string{e.Name, e.Description, game.EventTime(e.Event)} {
		b = append(b, str(field)...)
	}
	s.reply(roomEventInfo, b)
}

// handleGetGroupBadges answers 309 with the badges of the groups the room's habbos show.
func handleGetGroupBadges(s *session, me habbo.Habbo, _ []byte) {
	groups := game.GroupBadges(me)
	b := vl64(len(groups))
	for _, g := range groups {
		b = append(b, vl64(int(g.ID))...)
		b = append(b, str(g.Badge)...)
	}
	s.reply(groupBadges, b)
}

// handleGetGroupDetails answers 311 with a group's name and description, and -1 for its room, which groups have not;
// a group that does not exist is -1 alone.
func handleGetGroupDetails(s *session, _ habbo.Habbo, body []byte) {
	id, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(231, body)
		return
	}
	g, ok, err := game.GroupDetails(context.Background(), s.db, int64(id))
	if err != nil {
		s.fail(err)
		return
	}
	if !ok {
		s.reply(groupDetails, vl64(-1))
		return
	}
	b := append(vl64(int(g.ID)), str(g.Name)...)
	b = append(b, str(g.Description)...)
	b = append(b, vl64(-1)...)
	b = append(b, str("")...)
	s.reply(groupDetails, b)
}

// handleGetUserTags answers 350 with a habbo's tags from the site.
func handleGetUserTags(s *session, _ habbo.Habbo, body []byte) {
	id, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(263, body)
		return
	}
	tags, err := game.UserTags(context.Background(), s.db, int64(id))
	if err != nil {
		s.fail(err)
		return
	}
	b := append(vl64(int(id)), vl64(len(tags))...)
	for _, tag := range tags {
		b = append(b, str(tag)...)
	}
	s.reply(userTagList, b)
}

// handleSetBadge wears the badges the client's badge window puts in its five slots: five times a slot and a code,
// empty for none (decision server/0083).
func handleSetBadge(s *session, me habbo.Habbo, body []byte) {
	r := bytes.NewReader(body)
	var slots [5]string
	for range 5 {
		slot, err := encoding.ReadVL64(r)
		if err != nil {
			s.malformed(158, body)
			return
		}
		code, err := encoding.ReadB64String(r)
		if err != nil {
			s.malformed(158, body)
			return
		}
		if slot >= 1 && slot <= 5 {
			slots[slot-1] = code
		}
	}
	s.ruled(game.SetBadges(context.Background(), s.db, me, slots))
}

// sendLook writes 266: the habbo's room index, its figure, its sex and its motto, which the client draws at once on
// the habbo it names. A look the client cannot read is logged, and the session goes on.
func (s *session) sendLook(c game.LookChanged) {
	var b bytes.Buffer
	b.Write(vl64(c.Index))
	for _, field := range []string{c.Figure, c.Gender, c.Motto} {
		if err := encoding.WriteString(&b, field); err != nil {
			slog.Warn(fmt.Sprintf("r26 %s: the look of %d: %v", s.addr, c.Index, err))
			return
		}
	}
	s.reply(figureChange, b.Bytes())
}

// sendBadges writes 228: a habbo's web id, its avatar id, then the badges it wears with their slots.
func (s *session) sendBadges(c game.BadgesChanged) {
	s.reply(userBadge, append(str(strconv.FormatInt(c.AvatarID, 10)), wornBadges(c.Worn)...))
}

// handleRoomQueueChange moves the habbo to the line of the target it sends, the room's or the spectators'.
func handleRoomQueueChange(s *session, me habbo.Habbo, body []byte) {
	target, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(211, body)
		return
	}
	game.ChangeQueue(me, int(target))
}

// handleGetSpectatorAmount answers 298: how many watch the habbo's room and how many may, -1 when it watches none.
func handleGetSpectatorAmount(s *session, me habbo.Habbo, _ []byte) {
	count, most := game.SpectatorCount(me)
	s.reply(spectatorAmount, append(vl64(count), vl64(most)...))
}

// sendQueue writes 259: each set's name and target, then its two queues, club and the set's own, with how many of
// each come in before the habbo (decision server/0090).
func (s *session) sendQueue(q game.QueueChanged) {
	b := vl64(len(q.Sets))
	for _, set := range q.Sets {
		b = append(b, str(set.Name)...)
		b = append(b, vl64(set.Target)...)
		b = append(b, vl64(2)...)
		b = append(b, str("club")...)
		b = append(b, vl64(set.Club)...)
		b = append(b, str(set.Name)...)
		b = append(b, vl64(set.Others)...)
	}
	s.reply(roomQueueData, b)
}

// sendQueueAdmitted lets the habbo go on into the room its queue let it into: 254 first for a spectator, then 69 for a
// public room, as #room_directory would have, or 41 for a habbo room, on which the client sends GOTOFLAT.
func (s *session) sendQueueAdmitted(a game.QueueAdmitted) {
	if a.Spectator {
		s.reply(youAreSpectator, nil)
	}
	if a.Ref.Public {
		s.reply(roomReady, []byte(a.Model+" "+strconv.FormatInt(a.Ref.ID, 10)))
		return
	}
	s.reply(flatLetIn, str(""))
}
