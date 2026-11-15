package server

import (
	"fmt"
	"strconv"
	"strings"
	"testing"
)

// setState writes the state of a furni that stands in a room, as it would be saved.
func setState(t *testing.T, id int64, state string) {
	t.Helper()
	if _, err := testDB.ExecContext(t.Context(), `UPDATE furni SET state = ? WHERE id = ?`, state, id); err != nil {
		t.Fatal(err)
	}
}

// face reads the number a 90 carries after the dice's id: the face plus 38 times the id.
func face(t *testing.T, body string, id int64) int {
	t.Helper()
	rest, ok := strings.CutPrefix(body, strconv.FormatInt(id, 10)+" ")
	value, err := strconv.ParseInt(rest, 10, 64)
	if !ok || err != nil {
		t.Fatalf("the dice's value %q has no number after the id %d", body, id)
	}
	return int(value - id*38)
}

// Anyone changes a furni's state, a lamp on; only a habbo that controls the room opens a gate, which closes only
// while nobody stands in it; and nobody sets what the server draws: a dice, the wheel and the randomizer show their
// number after Holo's waits (packages/server/knowledge/r26/hh_room.md).
func TestUsingFurni(t *testing.T) {
	owner := habboWithTickets(t, "Croupier", "croupier")
	habboWithTickets(t, "Punter", "punter")
	flat := newRoom(t, owner, 2, "Casino", true)
	lamp := giveFurni(t, owner, 1279, "")
	gate := giveFurni(t, owner, 262, "")
	dice := giveFurni(t, owner, 101, "")
	randomizer := giveFurni(t, owner, 1236, "")
	wheel := giveFurni(t, owner, 93, "")
	standFurni(t, lamp, flat, 6, 2, 0)
	standFurni(t, gate, flat, 6, 8, 0)
	standFurni(t, dice, flat, 5, 6, 0)
	standFurni(t, randomizer, flat, 8, 11, 0)
	setState(t, gate, "C")
	if _, err := testDB.ExecContext(t.Context(), `UPDATE furni SET avatar_id = NULL, room_id = ?, wall_position = ':w=3,2 l=9,63 l' WHERE id = ?`, flat, wheel); err != nil {
		t.Fatal(err)
	}
	c, _ := login(t, "croupier")
	p, _ := login(t, "punter")
	both := []*client{c, p}
	c.knock(t, flat, "")
	c.expectNext(t, 41, "\x02")
	c.goToFlat(t, flat, 47, 42)
	c.arrive(t)
	p.knock(t, flat, "")
	p.expectNext(t, 41, "\x02")
	p.goToFlat(t, flat)
	p.arrive(t)
	c.nextBody(t, 28)
	c.nextBody(t, 34)
	c.walkTo(t, "0", 5, 5)
	id := func(furni int64) string { return strconv.FormatInt(furni, 10) }

	// A lamp turns on for anyone; a gate opens only for a habbo that controls the room.
	p.send(t, 74, b64String(t, id(lamp))+b64String(t, "ON"))
	expectAll(t, both, 88, id(lamp)+"\x02ON\x02")
	p.send(t, 74, b64String(t, id(gate))+b64String(t, "O"))
	p.send(t, 74, b64String(t, id(dice))+b64String(t, "6"))
	p.send(t, 74, b64String(t, id(lamp))+b64String(t, strings.Repeat("x", 40)))
	c.send(t, 74, b64String(t, id(gate))+b64String(t, "o"))
	expectAll(t, both, 88, id(gate)+"\x02O\x02")
	if got := furniRow(t, lamp).State + "," + furniRow(t, gate).State + "," + furniRow(t, dice).State; got != "ON,O," {
		t.Errorf("the lamp, the gate and the dice are saved as %q, want ON, O and nothing", got)
	}

	// A habbo walks through the open gate, which does not close on it.
	if tiles, last := p.walkTo(t, "1", 6, 8); !strings.HasPrefix(last, "1 6,8,0,") {
		t.Fatalf("the punter walked %v and stopped as %q, want it in the open gate at 6,8", tiles, last)
	}
	c.extendDeadline(t)
	c.send(t, 74, b64String(t, id(gate))+b64String(t, "C"))
	p.walkTo(t, "1", 6, 9)
	c.extendDeadline(t)
	c.send(t, 74, b64String(t, id(gate))+b64String(t, "C"))
	expectAll(t, both, 88, id(gate)+"\x02C\x02")
	p.send(t, 75, b64Short(t, 6)+b64Short(t, 8))

	// The randomizer, the wheel and the dice draw their numbers: 5, 4.25 and 2 seconds after they start.
	for _, client := range both {
		client.extendDeadline(t)
	}
	p.send(t, 247, vl64String(t, int32(wheel)))
	p.send(t, 76, id(dice))
	p.send(t, 314, vl64String(t, int32(randomizer)))
	expectAll(t, both, 88, id(randomizer)+"\x02123456789\x02")
	c.send(t, 247, vl64String(t, int32(wheel)))
	spinning := fmt.Sprintf("%d\thabbowheel\t \t:w=3,2 l=9,63 l\t-1", wheel)
	expectAll(t, both, 85, spinning)
	c.send(t, 76, id(dice))
	expectAll(t, both, 90, id(dice))
	for _, client := range both {
		gotID, body := client.nextSkipping(t, 34)
		if rolled := face(t, body, dice); gotID != 90 || rolled < 1 || rolled > 6 || strconv.Itoa(rolled) != furniRow(t, dice).State {
			t.Errorf("the dice stopped with %d %q, the face %d; want 90 and a face 1 to 6, the one saved", gotID, body, rolled)
		}
		client.extendDeadline(t)
	}
	for _, client := range both {
		gotID, body := client.nextSkipping(t, 34)
		number, ok := strings.CutPrefix(body, strings.TrimSuffix(spinning, "-1"))
		if n, err := strconv.Atoi(number); gotID != 85 || !ok || err != nil || n < 0 || n > 9 || number != furniRow(t, wheel).State {
			t.Errorf("the wheel stopped with %d %q; want 85 and a number 0 to 9, the one saved", gotID, body)
		}
	}
	for _, client := range both {
		gotID, body := client.nextSkipping(t, 34)
		number := strings.TrimSuffix(strings.TrimPrefix(body, id(randomizer)+"\x02"), "\x02")
		if n, err := strconv.Atoi(number); gotID != 88 || err != nil || n < 1 || n > 4 || number != furniRow(t, randomizer).State {
			t.Errorf("the randomizer stopped with %d %q; want 88 and a number 1 to 4, the one saved", gotID, body)
		}
	}
	c.send(t, 77, id(dice))
	expectAll(t, both, 90, fmt.Sprintf("%d %d", dice, dice*38))

	// A drink comes into the hand, and STOP takes it out.
	c.send(t, 80, "5")
	if line := p.awaitStatus(t, "0", "carryd"); !strings.Contains(line, "/carryd 5/") {
		t.Errorf("with a drink the croupier's status is %q, want carryd 5", line)
	}
	c.send(t, 80, "99")
	c.send(t, 88, "CarryItem")
	if line := statusLines(p.nextBody(t, 34))["0"]; strings.Contains(line, "carryd") {
		t.Errorf("after STOP the croupier's status is %q, want no drink", line)
	}
}
