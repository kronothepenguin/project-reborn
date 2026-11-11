package r26

import (
	"bytes"
	"context"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/server/encoding"
	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// The messages of hh_room about a room's furni (plans/server/reference/r26/hh_room.md).
const (
	flatProperty          = 46
	itemData              = 48
	doorFlat              = 62
	doorOut               = 89
	doorIn                = 92
	noUserForGift         = 76
	itemsAdded            = 83
	itemRemoved           = 84
	itemUpdated           = 85
	stuffDataUpdate       = 88
	diceValue             = 90
	activeObjectAdd       = 93
	activeObjectRemove    = 94
	activeObjectUpdate    = 95
	stripUpdated          = 101
	tradeYouAreNotAllowed = 102
	tradeOtherNotAllowed  = 103
	tradeItems            = 108
	tradeAccept           = 109
	tradeClose            = 110
	presentOpen           = 129
	slideObjectBundle     = 230
)

// The move types of 230: no habbo rode the roller, or one slides with it.
const (
	rolledAlone   = 0
	rolledSliding = 2
)

// handlePlaceStuff places a furni of the habbo's hand in its room: `<strip id> <x> <y> <direction>` for a floor
// furni, and `<strip id> :w=<x>,<y> l=<x>,<y> <r or l>` for a wall item. The strip id is the furni's id. A furni that
// may not stand there stays in the hand, which the client asks for again.
func handlePlaceStuff(s *session, me habbo.Habbo, body []byte) {
	fields := strings.Fields(string(body))
	if len(fields) != 4 {
		s.malformed(90, body)
		return
	}
	id, err := strconv.ParseInt(fields[0], 10, 64)
	if err != nil {
		s.malformed(90, body)
		return
	}
	if strings.HasPrefix(fields[1], ":w=") {
		if _, err := game.PlaceWallItem(context.Background(), s.db, me, id, strings.Join(fields[1:], " ")); err != nil {
			s.fail(err)
		}
		return
	}
	at, ok := ints(fields[1:])
	if !ok {
		s.malformed(90, body)
		return
	}
	if _, err := game.PlaceFurni(context.Background(), s.db, me, id, at[0], at[1], at[2]); err != nil {
		s.fail(err)
	}
}

// handleMoveStuff moves or turns a floor furni of the habbo's room: `<id> <x> <y> <direction>`. A furni that may not
// stand there stays, and the habbo's client, which already moved it, gets it back as it stands.
func handleMoveStuff(s *session, me habbo.Habbo, body []byte) {
	fields := strings.Fields(string(body))
	values, ok := ints(fields)
	if len(fields) != 4 || !ok {
		s.malformed(73, body)
		return
	}
	item, found, err := game.MoveFurni(context.Background(), s.db, me, int64(values[0]), values[1], values[2], values[3])
	if err != nil {
		s.fail(err)
		return
	}
	if found && (item.X != int64(values[1]) || item.Y != int64(values[2]) || item.Direction != int64(values[3])) {
		s.reply(activeObjectUpdate, activeObject(item))
	}
}

// handleAddStripItem picks a furni of the habbo's room up into its hand: `new stuff <id>` for a floor furni and
// `new item <id>` for a wall item. The hand then comes again, as Holo sent it.
func handleAddStripItem(s *session, me habbo.Habbo, body []byte) {
	fields := strings.Fields(string(body))
	if len(fields) != 3 || fields[0] != "new" || (fields[1] != "stuff" && fields[1] != "item") {
		s.malformed(67, body)
		return
	}
	id, err := strconv.ParseInt(fields[2], 10, 64)
	if err != nil {
		s.malformed(67, body)
		return
	}
	picked, err := game.PickUpFurni(context.Background(), s.db, me, id)
	if err != nil {
		s.fail(err)
		return
	}
	if picked {
		s.sendHand(me, s.handPage)
	}
}

// handlePresentOpen opens the box the client names, which stands in the habbo's own room: 129 shows what it held on
// the box's card, three lines, the furni's class, its class again with a wall item's data, and its colours; then the
// hand comes at its last page, where the furni landed, as Holo sent it.
func handlePresentOpen(s *session, me habbo.Habbo, body []byte) {
	id, err := strconv.ParseInt(strings.TrimSpace(string(body)), 10, 64)
	if err != nil {
		s.malformed(78, body)
		return
	}
	held, ok, err := game.OpenPresent(context.Background(), s.db, me, id)
	if err != nil {
		s.fail(err)
		return
	}
	if !ok {
		return
	}
	code, colours := held.Sprite, held.Colours
	if held.Kind == "wall" {
		colours = ""
		if held.Data != "" {
			code += " " + held.Data
		}
	}
	s.reply(presentOpen, []byte(printable(held.Sprite)+"\r"+printable(code)+"\r"+printable(colours)))
	s.sendHand(me, game.LastHandPage)
}

// handleSetStuffData changes a floor furni's state: a string for the furni's id and one for the state.
func handleSetStuffData(s *session, me habbo.Habbo, body []byte) {
	r := bytes.NewReader(body)
	id, state, ok := furniID(r), "", false
	if id > 0 {
		var err error
		state, err = encoding.ReadB64String(r)
		ok = err == nil
	}
	if !ok {
		s.malformed(74, body)
		return
	}
	if err := game.SetFurniState(context.Background(), s.db, me, id, state); err != nil {
		s.fail(err)
	}
}

// handleSetItemState changes a wall item's state: a string for the item's id and a number for the state.
func handleSetItemState(s *session, me habbo.Habbo, body []byte) {
	r := bytes.NewReader(body)
	id := furniID(r)
	state, err := encoding.ReadVL64(r)
	if id == 0 || err != nil {
		s.malformed(214, body)
		return
	}
	if err := game.SetItemState(context.Background(), s.db, me, id, int(state)); err != nil {
		s.fail(err)
	}
}

// furniID reads a furni's id sent as a string, and 0 for anything else.
func furniID(r *bytes.Reader) int64 {
	text, err := encoding.ReadB64String(r)
	if err != nil {
		return 0
	}
	id, err := strconv.ParseInt(text, 10, 64)
	if err != nil || id < 0 {
		return 0
	}
	return id
}

// handleThrowDice rolls a dice or spins a bottle, and handleDiceOff turns a dice off; each names the furni by its id
// as text.
func handleThrowDice(s *session, me habbo.Habbo, body []byte) {
	rawID(s, 76, body, func(id int64) error { return game.ThrowDice(context.Background(), s.db, me, id) })
}

func handleDiceOff(s *session, me habbo.Habbo, body []byte) {
	rawID(s, 77, body, func(id int64) error { return game.CloseDice(context.Background(), s.db, me, id) })
}

// handleSpinWheel spins a wheel of fortune, and handleSetRandomState starts a love randomizer; each names the furni
// by its id as a number.
func handleSpinWheel(s *session, me habbo.Habbo, body []byte) {
	numberID(s, 247, body, func(id int64) error { return game.SpinWheel(context.Background(), s.db, me, id) })
}

func handleSetRandomState(s *session, me habbo.Habbo, body []byte) {
	numberID(s, 314, body, func(id int64) error { return game.SetRandomState(context.Background(), s.db, me, id) })
}

// rawID runs use with the furni id that a command's body holds as text.
func rawID(s *session, command int, body []byte, use func(id int64) error) {
	id, err := strconv.ParseInt(strings.TrimSpace(string(body)), 10, 64)
	if err != nil {
		s.malformed(command, body)
		return
	}
	if err := use(id); err != nil {
		s.fail(err)
	}
}

// numberID runs use with the furni id that a command's body holds as a number.
func numberID(s *session, command int, body []byte, use func(id int64) error) {
	id, err := encoding.ReadVL64(bytes.NewReader(body))
	if err != nil {
		s.malformed(command, body)
		return
	}
	if err := use(int64(id)); err != nil {
		s.fail(err)
	}
}

// handleCarryDrink puts in the habbo's hand the drink whose token the furni gave the client.
func handleCarryDrink(_ *session, me habbo.Habbo, body []byte) {
	game.CarryDrink(me, strings.TrimSpace(string(body)))
}

// sendFurniState tells the client a furni's new state: 88 for a floor furni, its id and the state, and 85 for a wall
// item, its line.
func (s *session) sendFurniState(item room.Furni) {
	if item.Definition.Kind == "wall" {
		s.reply(itemUpdated, []byte(strings.TrimSuffix(wallItemLines([]room.Furni{item}), "\r")))
		return
	}
	s.reply(stuffDataUpdate, append(str(strconv.FormatInt(item.ID, 10)), str(stuffData(item.State))...))
}

// sendDice tells the client that a dice rolls, 90 with its id, or the face it stopped on, its id and the face plus 38
// times the id, as the client reads it.
func (s *session) sendDice(e game.DiceRolled) {
	id := strconv.FormatInt(e.ID, 10)
	if e.Rolling {
		s.reply(diceValue, []byte(id))
		return
	}
	s.reply(diceValue, []byte(id+" "+strconv.FormatInt(e.ID*38+int64(e.Face), 10)))
}

// sendRolled tells the client what a roller carried, 230: the tile it left and the one it reached, the count of the
// furni and each one's id and altitudes, before and after, the roller's id, and how the habbo it carried moves, 0
// when it carried none or 2, a slide, with the habbo's index and heights.
func (s *session) sendRolled(e game.FurniRolled) {
	var b bytes.Buffer
	for _, v := range []int{e.FromX, e.FromY, e.ToX, e.ToY, len(e.Furni)} {
		b.Write(vl64(v))
	}
	for _, f := range e.Furni {
		b.Write(vl64(int(f.ID)))
		b.Write(str(height(f.From)))
		b.Write(str(height(f.To)))
	}
	b.Write(vl64(int(e.Roller)))
	if e.Rider == nil {
		b.Write(vl64(rolledAlone))
	} else {
		b.Write(vl64(rolledSliding))
		b.Write(vl64(e.Rider.Index))
		b.Write(str(height(e.Rider.From)))
		b.Write(str(height(e.Rider.To)))
	}
	s.reply(slideObjectBundle, b.Bytes())
}

// handleFlatPropByItem uses a wallpaper, a floor or a landscape of the habbo's hand on its room:
// `<class>/<strip id>`. The room then gets 46 with the property and its pattern.
func handleFlatPropByItem(s *session, me habbo.Habbo, body []byte) {
	property, strip, ok := strings.Cut(string(body), "/")
	id, err := strconv.ParseInt(strip, 10, 64)
	if !ok || err != nil {
		s.malformed(66, body)
		return
	}
	if _, err := game.Decorate(context.Background(), s.db, me, property, id); err != nil {
		s.fail(err)
	}
}

// handleGetItemData answers what is written on a post-it, named by its id as text, with 48: the id, a tab, the
// colour, a space and the text.
func handleGetItemData(s *session, me habbo.Habbo, body []byte) {
	id, err := strconv.ParseInt(string(body), 10, 64)
	if err != nil {
		s.malformed(83, body)
		return
	}
	item, text, ok, err := game.PostIt(context.Background(), s.db, me, id)
	if err != nil {
		s.fail(err)
		return
	}
	if ok {
		s.reply(itemData, []byte(strconv.FormatInt(id, 10)+"\t"+printable(item.State)+" "+text))
	}
}

// handleSetItemData writes a post-it: `<id>/<colour> <text>`, the colour six hexadecimal digits. The room then gets
// 85 with the note's colour.
func handleSetItemData(s *session, me habbo.Habbo, body []byte) {
	name, data, ok := strings.Cut(string(body), "/")
	id, err := strconv.ParseInt(name, 10, 64)
	if !ok || err != nil || len(data) < 6 {
		s.malformed(84, body)
		return
	}
	if err := game.WritePostIt(context.Background(), s.db, me, id, data[:6], strings.TrimPrefix(data[6:], " ")); err != nil {
		s.fail(err)
	}
}

// handleRemoveItem deletes a post-it, named by its id as text. The room then gets 84.
func handleRemoveItem(s *session, me habbo.Habbo, body []byte) {
	id, err := strconv.ParseInt(string(body), 10, 64)
	if err != nil {
		s.malformed(85, body)
		return
	}
	if err := game.DeletePostIt(context.Background(), s.db, me, id); err != nil {
		s.fail(err)
	}
}

// handleIntoDoor steps the habbo into a teleport, handleGetDoorFlat answers where the teleport it stands in leads,
// 62 with the other teleport and its room, and handleDoorGoIn shows the room that it goes, 89. Each names the
// teleport by its id as text. A teleport whose partner stands in no room gets no answer.
func handleIntoDoor(s *session, me habbo.Habbo, body []byte) {
	if id, ok := textID(s, 81, body); ok {
		game.EnterTeleport(me, id)
	}
}

func handleGetDoorFlat(s *session, me habbo.Habbo, body []byte) {
	id, ok := textID(s, 28, body)
	if !ok {
		return
	}
	teleport, flat, ok, err := game.TeleportTarget(context.Background(), s.db, me, id)
	if err != nil {
		s.fail(err)
		return
	}
	if ok {
		s.reply(doorFlat, append(vl64(int(teleport)), vl64(int(flat))...))
	}
}

func handleDoorGoIn(s *session, me habbo.Habbo, body []byte) {
	if id, ok := textID(s, 82, body); ok {
		game.LeaveByTeleport(me, id)
	}
}

// handleGoViaDoor brings the habbo out of the other teleport: `<flat id>/<teleport id>`. In another room, which the
// habbo chose, 41 lets it in as an open door does, and it goes on with GOTOFLAT.
func handleGoViaDoor(s *session, me habbo.Habbo, body []byte) {
	flatText, teleportText, ok := strings.Cut(string(body), "/")
	flat, err := strconv.ParseInt(flatText, 10, 64)
	teleport, err2 := strconv.ParseInt(teleportText, 10, 64)
	if !ok || err != nil || err2 != nil {
		s.malformed(54, body)
		return
	}
	if game.GoViaTeleport(me, flat, teleport) {
		s.reply(flatLetIn, str(""))
	}
}

// handleTradeOpen opens a trade with the habbo whose room index is the body: both get 108, or the sender 102 when it
// may not trade and 103 when the other may not.
func handleTradeOpen(s *session, me habbo.Habbo, body []byte) {
	index, err := strconv.Atoi(string(body))
	if err != nil {
		s.malformed(71, body)
		return
	}
	opening, err := game.OpenTrade(context.Background(), s.db, me, index)
	if err != nil {
		s.fail(err)
		return
	}
	switch opening {
	case game.TradeNotAllowed:
		s.reply(tradeYouAreNotAllowed, nil)
	case game.OtherNotAllowed:
		s.reply(tradeOtherNotAllowed, nil)
	}
}

// handleTradeAddItem offers a furni of the hand, named by its strip id as text: both get 108.
func handleTradeAddItem(s *session, me habbo.Habbo, body []byte) {
	id, ok := textID(s, 72, body)
	if !ok {
		return
	}
	if err := game.OfferFurni(context.Background(), s.db, me, id); err != nil {
		s.fail(err)
	}
}

// handleTradeAccept accepts the trade, 109 to both, and ends it when both have, 110 to both. handleTradeUnaccept
// takes both accepts away, and handleTradeClose ends the trade with nothing changed.
func handleTradeAccept(s *session, me habbo.Habbo, _ []byte) {
	if err := game.AcceptTrade(context.Background(), s.db, me); err != nil {
		s.fail(err)
	}
}

func handleTradeUnaccept(_ *session, me habbo.Habbo, _ []byte) { game.UnacceptTrade(me) }

func handleTradeClose(_ *session, me habbo.Habbo, _ []byte) { game.CloseTrade(me) }

// sendTrade writes 108: a line for each side, the habbo's own first, with its name, whether it accepted and the
// furni it offers, as the hand writes them, separated by tabs.
func (s *session) sendTrade(e game.TradeChanged) {
	lines := make([]string, len(e.Sides))
	for i, side := range e.Sides {
		lines[i] = printable(side.Name) + "\t" + strconv.FormatBool(side.Accepted) + "\t" + stripItems(side.Items)
	}
	s.reply(tradeItems, []byte(strings.Join(lines, "\r")))
}

// textID reads a furni's id sent as the whole body, and logs a body that is none as a malformed message id.
func textID(s *session, message int, body []byte) (int64, bool) {
	id, err := strconv.ParseInt(string(body), 10, 64)
	if err != nil {
		s.malformed(message, body)
		return 0, false
	}
	return id, true
}

// ints reads every field as a number.
func ints(fields []string) ([]int, bool) {
	values := make([]int, 0, len(fields))
	for _, field := range fields {
		v, err := strconv.Atoi(field)
		if err != nil {
			return nil, false
		}
		values = append(values, v)
	}
	return values, true
}

// sendFurniPlaced tells the client that a furni now stands in its room: 93 for a floor furni, 83 for a wall item.
func (s *session) sendFurniPlaced(item room.Furni) {
	if item.Definition.Kind == "wall" {
		s.reply(itemsAdded, []byte(wallItemLines([]room.Furni{item})))
		return
	}
	s.reply(activeObjectAdd, activeObject(item))
}

// activeObjectsBody writes the floor furni among items as 32 carries them: their count, then each as an active
// object.
func activeObjectsBody(items []room.Furni) []byte {
	var b bytes.Buffer
	count := 0
	for _, item := range items {
		if item.Definition.Kind != "wall" {
			count++
			b.Write(activeObject(item))
		}
	}
	return append(vl64(count), b.Bytes()...)
}

// activeObject writes a floor furni as the client reads one in 32, 93 and 95: its id and class, its tile, its length
// and width, its direction, its altitude, its colours, an empty runtime data, 0 for the extra, and its state as the
// stuff data (plans/server/reference/r26/hh_room.md#an-active-object).
func activeObject(item room.Furni) []byte {
	d := item.Definition
	var b bytes.Buffer
	b.Write(str(strconv.FormatInt(item.ID, 10)))
	b.Write(str(stuffData(d.Sprite)))
	for _, v := range []int64{item.X, item.Y, d.Length, d.Width, item.Direction} {
		b.Write(vl64(int(v)))
	}
	b.Write(str(height(item.Altitude)))
	b.Write(str(stuffData(d.Colours)))
	b.Write(str(""))
	b.Write(vl64(0))
	b.Write(str(stuffData(item.State)))
	return b.Bytes()
}

// stuffData keeps a state inside its string: any control character but the tab, which separates a trophy's name,
// day and inscription, becomes a space.
func stuffData(value string) string {
	return strings.Map(func(r rune) rune {
		if r < ' ' && r != '\t' {
			return ' '
		}
		return r
	}, value)
}

// wallItemLines writes the wall items among items as 45 and 83 carry them, a line each: the id, the class, a space
// where the owner goes, the place on the wall, and the item's state, or without one what its definition carries, a
// poster's number, tab-separated (plans/server/reference/r26/hh_room.md#a-wall-item).
func wallItemLines(items []room.Furni) string {
	var b strings.Builder
	for _, item := range items {
		if item.Definition.Kind != "wall" {
			continue
		}
		data := item.State
		if data == "" {
			data = item.Definition.Data
		}
		values := []string{strconv.FormatInt(item.ID, 10), printable(item.Definition.Sprite), " ", printable(item.WallPosition), printable(data)}
		b.WriteString(strings.Join(values, "\t") + "\r")
	}
	return b.String()
}
