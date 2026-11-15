package r26

import (
	"context"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// stripInfo is hh_room's 140, the hand (packages/server/knowledge/r26/hh_room.md#the-hand).
const stripInfo = 140

// handleGetStrip sends a page of the habbo's hand: the first for new, the one after or before for next and prev, and
// the same one again for update.
func handleGetStrip(s *session, me habbo.Habbo, body []byte) {
	page := s.handPage
	switch string(body) {
	case "new":
		page = 0
	case "next":
		page++
	case "prev":
		page--
	case "update":
	default:
		s.malformed(65, body)
		return
	}
	s.sendHand(me, page)
}

// sendHand sends the page of the habbo's hand, or the nearest one it has, and keeps which one the client is on.
func (s *session) sendHand(me habbo.Habbo, page int) {
	hand, err := game.HandPage(context.Background(), s.db, me, page)
	if err != nil {
		s.fail(err)
		return
	}
	s.handPage = hand.Page
	s.reply(stripInfo, []byte(handLines(hand)))
}

// handLines writes a page of the hand as 140 carries it: its furni, then on a line of its own how many furni the
// whole hand holds.
func handLines(hand game.Hand) string {
	return stripItems(hand.Items) + "\r" + strconv.Itoa(hand.Total)
}

// stripItems writes furni as the hand and a trade carry them: each furni ended by a slash, its values separated by
// the character 30. A furni's values are SI, its strip id, its place, S for a floor furni or I for a wall item, its
// id and its class; then a floor furni's length, width, state, colours and whether it is recyclable, or a wall
// item's data and whether it is recyclable. A wall item's data is its state when it has one, as the notes left on a
// pad of post-its, and else its definition's, a poster's number. The strip id is the furni's id.
func stripItems(items []game.HandItem) string {
	var b strings.Builder
	for _, item := range items {
		id := strconv.FormatInt(item.ID, 10)
		d := item.Definition
		values := []string{"SI", id, strconv.Itoa(item.Position)}
		if d.Kind == "wall" {
			data := item.State
			if data == "" {
				data = d.Data
			}
			values = append(values, "I", id, handValue(d.Sprite), handValue(data))
		} else {
			values = append(values, "S", id, handValue(d.Sprite), strconv.FormatInt(d.Length, 10), strconv.FormatInt(d.Width, 10),
				handValue(item.State), handValue(d.Colours))
		}
		values = append(values, strconv.Itoa(flag(d.Recyclable)))
		b.WriteString(strings.Join(values, "\x1e") + "/")
	}
	return b.String()
}

// handValue keeps a value in its place in the hand: a slash, which ends a furni there, and any control character,
// among them the one that separates the values, become spaces.
func handValue(value string) string {
	return strings.ReplaceAll(printable(value), "/", " ")
}
