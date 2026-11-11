package r26

import (
	"bytes"
	"context"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// The messages of hh_room about a room's furni (plans/server/reference/r26/hh_room.md).
const (
	noUserForGift      = 76
	itemsAdded         = 83
	itemRemoved        = 84
	activeObjectAdd    = 93
	activeObjectRemove = 94
	activeObjectUpdate = 95
	stripUpdated       = 101
	presentOpen        = 129
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
