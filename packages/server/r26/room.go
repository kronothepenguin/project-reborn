package r26

import (
	"bytes"
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/server/encoding"
	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// The messages of hh_room the server sends (plans/server/reference/r26/hh_room.md), and hh_navigator's 224, which
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
	roomItems             = 45
	roomOwner             = 47
	roomReady             = 69
	doorbellRinging       = 91
	flatNotAllowedToEnter = 131
	roomAdData            = 208
	cantConnect           = 224
	interstitialData      = 258
	userTypingStatus      = 361
	ignoreUserResult      = 419
	ignoreList            = 420
)

// The reasons of 224, as hh_navigator shows them.
const (
	cantConnectFull   = 1
	cantConnectBanned = 4
)

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
	53:  loggedIn(handleQuit),
	57:  loggedIn(handleTryFlat),
	59:  loggedIn(handleGoToFlat),
	60:  loggedIn(handleGetHeightMap),
	61:  loggedIn(handleGetUsers),
	62:  loggedIn(handleGetObjects),
	63:  loggedIn(handleGetItems),
	64:  loggedIn(handleGetStatus),
	75:  loggedIn(handleMove),
	79:  loggedIn(handleLookTo),
	88:  loggedIn(handleStop),
	93:  loggedIn(handleDance),
	94:  loggedIn(handleWave),
	98:  loggedIn(handleLetUserIn),
	126: loggedIn(handleGetRoomAd),
	182: loggedIn(handleGetInterstitial),
	317: loggedIn(handleStartTyping),
	318: loggedIn(handleCancelTyping),
	319: loggedIn(handleIgnoreUser),
	321: loggedIn(handleGetIgnoreList),
	322: loggedIn(handleUnignoreUser),
}

// handleRoomDirectory heads the habbo for a room, out of the one it is in: 19, which Holo sent for both kinds, then a
// public room's 69 with its model as the marker, or 224 with 1 when it is full. A habbo room goes on with TRYFLAT.
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
	switch a {
	case game.Admitted:
		s.reply(roomReady, []byte(m.Name+" "+strconv.FormatInt(ref.ID, 10)))
	case game.Full:
		s.reply(cantConnect, vl64(cantConnectFull))
	}
}

// handleTryFlat answers the habbo at the door of the habbo room it chose: 41 lets it in, and the client goes on with
// GOTOFLAT; 91 keeps it at the doorbell; 131 turns it away when nobody can answer; 33 Incorrect flat password; and 224
// with 1 for a full room or with 4 for a ban.
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
	case game.Full:
		s.reply(cantConnect, vl64(cantConnectFull))
	case game.Banned:
		s.reply(cantConnect, vl64(cantConnectBanned))
	}
}

// handleGoToFlat takes the habbo into the habbo room whose door let it through: 69 with model_<model> as the marker,
// then 47 for its owner and 42 for a habbo with rights, as Holo sent them.
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
	if e.Owner {
		s.reply(roomOwner, nil)
	}
	if e.Rights {
		s.reply(roomController, nil)
	}
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

// handleGetObjects sends the room's public furni, and its furniture, which no room holds before S5. Nothing asks for
// the furniture, 32, which the client needs to build the room, so it follows the public furni, as Holo sent it.
func handleGetObjects(s *session, me habbo.Habbo, _ []byte) {
	_, m, ok, err := game.Arrival(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	if !ok {
		return
	}
	var b strings.Builder
	for line := range strings.SplitSeq(m.PublicItems, "\n") {
		if fields := strings.Fields(line); len(fields) >= 6 {
			b.WriteString(strings.Join(fields[:6], " ") + "\r")
		}
	}
	s.reply(roomObjects, []byte(b.String()))
	s.reply(activeObjects, vl64(0))
}

// handleGetItems sends a habbo room's wall items, which no room holds before S5.
func handleGetItems(s *session, me habbo.Habbo, _ []byte) {
	if _, _, ok, err := game.Arrival(context.Background(), s.db, me); err != nil {
		s.fail(err)
	} else if ok {
		s.reply(roomItems, nil)
	}
}

// handleGetStatus brings the habbo into the room it built: it gets the others' statuses, then its own user line and
// status, which the others get too, as Holo sent them. A room that filled meanwhile gets 224 with 1.
func handleGetStatus(s *session, me habbo.Habbo, _ []byte) {
	visitors, a, err := game.EnterRoom(context.Background(), s.db, me)
	if err != nil {
		s.fail(err)
		return
	}
	switch a {
	case game.Full:
		s.reply(cantConnect, vl64(cantConnectFull))
		return
	case game.NoRoom:
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
	if string(body) == "Dance" {
		game.StopDancing(me)
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

// handleGetInterstitial sends the ad shown while a room loads (plans/server decision 0070).
func handleGetInterstitial(s *session, _ habbo.Habbo, _ []byte) {
	s.reply(interstitialData, ad("game.loadingAdImage", "game.loadingAdLink"))
}

// handleGetRoomAd sends the ad shown in a room (plans/server decision 0070).
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
// sex and badges, its worn badge in slot 1. Each line ends with a carriage return, which ends a line for the client,
// so none may hold one.
func writeUser(b *strings.Builder, v game.Visitor) {
	badges := ""
	if v.Habbo.Worn != "" {
		badges = "1:" + v.Habbo.Worn
	}
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
