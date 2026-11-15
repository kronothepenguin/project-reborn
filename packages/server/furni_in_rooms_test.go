package server

import (
	"fmt"
	"strconv"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// standFurni takes a furni out of its hand and stands it in the habbo room, on a tile and turned, as placing will.
func standFurni(t *testing.T, id, flat int64, x, y, direction int) {
	t.Helper()
	_, err := testDB.ExecContext(t.Context(), `UPDATE furni SET avatar_id = NULL, room_id = ?, x = ?, y = ?, direction = ? WHERE id = ?`, flat, x, y, direction, id)
	if err != nil {
		t.Fatal(err)
	}
}

// walkTo sends MOVE and reads the room's statuses until the habbo of that index stops, and returns the tiles it
// stood on and its last status.
func (c *client) walkTo(t *testing.T, index string, x, y int) (tiles []string, last string) {
	t.Helper()
	c.extendDeadline(t)
	c.send(t, 75, b64Short(t, x)+b64Short(t, y))
	for {
		line, ok := statusLines(c.nextBody(t, 34))[index]
		if !ok {
			continue
		}
		place := strings.Fields(line)[1]
		tiles = append(tiles, strings.Join(strings.Split(place, ",")[:2], ","))
		if !strings.Contains(line, "/mv ") {
			return tiles, line
		}
	}
}

// A habbo room sends the furni that stands in it, floor furni as 32 and wall items as 45, and habbos walk around a
// solid, sit on a seat, lie on a bed and walk over a rug (packages/server/knowledge/r26/hh_room.md).
func TestARoomShowsItsFurniAndHabbosUseIt(t *testing.T) {
	owner := habboWithTickets(t, "Furnisher", "furnisher")
	flat := newRoom(t, owner, 2, "Showroom", true)
	die := giveFurni(t, owner, 101, "")
	chair := giveFurni(t, owner, 463, "")
	bed := giveFurni(t, owner, 444, "")
	rug := giveFurni(t, owner, 41, "")
	poster := giveFurni(t, owner, 105, "")
	inHand := giveFurni(t, owner, 465, "")
	standFurni(t, die, flat, 5, 5, 0)
	standFurni(t, chair, flat, 7, 5, 4)
	standFurni(t, bed, flat, 8, 8, 0)
	standFurni(t, rug, flat, 5, 8, 0)
	if _, err := testDB.ExecContext(t.Context(), `UPDATE furni SET avatar_id = NULL, room_id = ?, wall_position = ':w=3,2 l=9,63 l' WHERE id = ?`, flat, poster); err != nil {
		t.Fatal(err)
	}

	c, _ := login(t, "furnisher")
	c.knock(t, flat, "")
	c.expectNext(t, 41, "\x02")
	c.goToFlat(t, flat, 47, 42)
	c.send(t, 60, "")
	c.nextBody(t, 31)
	c.send(t, 61, "")
	c.nextBody(t, 28)
	c.send(t, 62, "")
	c.nextBody(t, 30)
	objects := c.nextBody(t, 32)
	wantChair := fmt.Sprintf("%d\x02rclr_chair\x02%s0\x020,0,0\x02\x02%s\x02", chair, vl64String(t, 7, 5, 1, 1, 4), vl64String(t, 0))
	if !strings.HasPrefix(objects, vl64String(t, 4)) || !strings.Contains(objects, wantChair) || strings.Contains(objects, strconv.FormatInt(inHand, 10)+"\x02") {
		t.Errorf("the room's floor furni, 32 = %q; want 4 of them, the chair as %q, and nothing of the hand", objects, wantChair)
	}
	c.send(t, 63, "")
	if items, want := c.nextBody(t, 45), fmt.Sprintf("%d\tposter\t \t:w=3,2 l=9,63 l\t44\r", poster); items != want {
		t.Errorf("the room's wall items, 45 = %q, want %q", items, want)
	}
	c.arrive(t)

	tiles, last := c.walkTo(t, "0", 7, 5)
	if strings.Contains(strings.Join(tiles, " "), "5,5") {
		t.Errorf("the habbo walked %v, through the die on 5,5", tiles)
	}
	if !strings.HasPrefix(last, "0 7,5,0,4,4/") || !strings.Contains(last, "/sit 1/") {
		t.Errorf("on the chair the habbo's status is %q; want it at 7,5 facing south, sitting 1 high", last)
	}

	if _, last = c.walkTo(t, "0", 9, 9); !strings.HasPrefix(last, "0 9,9,0,0,0/") || !strings.Contains(last, "/lay 1.5/") || strings.Contains(last, "sit") {
		t.Errorf("on the bed the habbo's status is %q; want it at 9,9 facing north, lying 1.5 high", last)
	}

	if _, last = c.walkTo(t, "0", 5, 8); !strings.HasPrefix(last, "0 5,8,0,") || strings.Contains(last, "lay") || strings.Contains(last, "sit") {
		t.Errorf("on the rug the habbo's status is %q; want it standing at 5,8", last)
	}

	c.extendDeadline(t)
	c.send(t, 75, b64Short(t, 5)+b64Short(t, 5))
	c.send(t, 79, "4 8")
	if line := statusLines(c.nextBody(t, 34))["0"]; !strings.HasPrefix(line, "0 5,8,0,6,6/") {
		t.Errorf("after a MOVE onto the die the habbo's status is %q; want it still on the rug, looking west", line)
	}

	var stored store.Furni
	if err := testDB.QueryRowContext(t.Context(), `SELECT id, x, y FROM furni WHERE id = ?`, chair).Scan(&stored.ID, &stored.X, &stored.Y); err != nil || stored.X != 7 || stored.Y != 5 {
		t.Errorf("the chair is stored at %d,%d: %v", stored.X, stored.Y, err)
	}
}
