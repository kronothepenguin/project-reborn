package server

import (
	"slices"
	"strings"
	"testing"
	"time"
)

// Every 2 seconds a roller carries the furni and the habbo that stand on it one tile the way it points: onto the
// next roller, then onto the floor, and never onto a tile that holds something (plans/server decision 0107).
func TestRollersCarryFurniAndHabbos(t *testing.T) {
	owner := habboWithTickets(t, "Conveyor", "conveyor")
	flat := newRoom(t, owner, 2, "Factory", true)
	var rollers [4]int64
	for i, at := range [][2]int{{6, 6}, {7, 6}, {6, 9}, {7, 9}} {
		rollers[i] = giveFurni(t, owner, 465, "")
		standFurni(t, rollers[i], flat, at[0], at[1], 2)
	}
	lamp := giveFurni(t, owner, 1279, "")
	standFurni(t, lamp, flat, 6, 6, 0)
	if _, err := testDB.ExecContext(t.Context(), `UPDATE furni SET altitude = 0.5 WHERE id = ?`, lamp); err != nil {
		t.Fatal(err)
	}
	wall := giveFurni(t, owner, 101, "")
	standFurni(t, wall, flat, 8, 9, 0)

	c, _ := login(t, "conveyor")
	c.knock(t, flat, "")
	c.expectNext(t, 41, "\x02")
	c.goToFlat(t, flat, 47, 42)
	c.arrive(t)
	c.extendDeadline(t)
	c.send(t, 75, b64Short(t, 6)+b64Short(t, 9))

	want := []string{
		vl64String(t, 6, 6, 7, 6, 1, int32(lamp)) + "0.5\x020.5\x02" + vl64String(t, int32(rollers[0]), 0),
		vl64String(t, 7, 6, 8, 6, 1, int32(lamp)) + "0.5\x020\x02" + vl64String(t, int32(rollers[1]), 0),
		vl64String(t, 6, 9, 7, 9, 0, int32(rollers[2]), 2, 0) + "0.5\x020.5\x02",
	}
	var rolled []string
	for range 60 {
		id, body := c.next(t)
		c.extendDeadline(t)
		if id == 230 {
			rolled = append(rolled, body)
		}
		if len(rolled) >= 3 && id == 34 && strings.Contains(statusLines(body)["0"], "0 7,9,0.5,") {
			break
		}
	}
	for _, body := range want {
		if !slices.Contains(rolled, body) {
			t.Errorf("the rollers sent %q, without %q", rolled, body)
		}
	}
	if len(rolled) != 3 {
		t.Errorf("the rollers moved things %d times, want 3: the lamp twice and the habbo once", len(rolled))
	}
	if row := furniRow(t, lamp); row.X != 8 || row.Y != 6 || row.Altitude != 0 {
		t.Errorf("the lamp is stored at %d,%d, %v high; want it on the floor at 8,6", row.X, row.Y, row.Altitude)
	}

	// The die ahead stops the habbo on the second roller, and nothing rolls any more.
	time.Sleep(2*time.Second + 500*time.Millisecond)
	c.extendDeadline(t)
	c.send(t, 65, "new")
	for {
		id, body := c.next(t)
		if id == 230 {
			t.Fatalf("a roller moved something onto a tile that holds furni, or off no roller: %q", body)
		}
		if id == 140 {
			break
		}
	}
}
