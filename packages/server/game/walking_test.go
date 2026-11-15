package game

import (
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// floorOf parses a floor from its rows, with its door on the first tile.
func floorOf(t *testing.T, items string, rows ...string) room.Floor {
	t.Helper()
	f, err := room.ParseFloor(store.RoomModel{Name: "test", Heightmap: strings.Join(rows, "\n"), PublicItems: items})
	if err != nil {
		t.Fatal(err)
	}
	return f
}

// walkAll walks the habbo until it stops, at most 50 steps, and returns the tiles it stepped on.
func walkAll(t *testing.T, floor room.Floor, all []*room.Occupant, o *room.Occupant) []tile {
	t.Helper()
	var steps []tile
	o.Walking = true
	for range 50 {
		sent := walk(floor, all, o)
		if !o.Walking {
			return steps
		}
		steps = append(steps, tile{o.X, o.Y})
		if sent.X == o.X && sent.Y == o.Y {
			t.Fatalf("the status sent %+v is where the habbo stepped to", sent)
		}
	}
	t.Fatalf("still walking after 50 steps: %v", steps)
	return nil
}

func habboAt(id int64, x, y, goalX, goalY int) *room.Occupant {
	return &room.Occupant{AvatarID: id, X: x, Y: y, GoalX: goalX, GoalY: goalY}
}

// The blocked tile in the middle stops the diagonal past it: a way that cut its corner would take 3 steps.
func TestAWayGoesAroundAWallWithoutCuttingItsCorner(t *testing.T) {
	floor := floorOf(t, "", "0000", "0x00", "0000")
	o := habboAt(1, 0, 0, 2, 2)
	steps := walkAll(t, floor, []*room.Occupant{o}, o)
	if len(steps) != 4 || steps[3] != (tile{2, 2}) {
		t.Fatalf("walked %v, want 4 steps to 2,2", steps)
	}
	prev := tile{0, 0}
	for _, s := range steps {
		if s == (tile{1, 1}) {
			t.Errorf("stepped on the wall: %v", steps)
		}
		if s.x != prev.x && s.y != prev.y {
			for _, side := range []tile{{s.x, prev.y}, {prev.x, s.y}} {
				if side == (tile{1, 1}) {
					t.Errorf("cut the wall's corner from %v to %v", prev, s)
				}
			}
		}
		prev = s
	}
}

// A habbo steps up or down at most 1 height (decision server/0065).
func TestAStepGoesUpOrDownAtMostOneHeight(t *testing.T) {
	floor := floorOf(t, "", "000", "020", "000")
	o := habboAt(1, 0, 1, 2, 1)
	for _, s := range walkAll(t, floor, []*room.Occupant{o}, o) {
		if s == (tile{1, 1}) {
			t.Errorf("stepped up 2 onto 1,1")
		}
	}
	if o.X != 2 || o.Y != 1 {
		t.Errorf("stopped at %d,%d, want 2,1", o.X, o.Y)
	}

	o = habboAt(1, 0, 0, 1, 1)
	if _, ok := nextStep(floor, []*room.Occupant{o}, o); ok {
		t.Error("a way leads up 2")
	}

	stairs := floorOf(t, "", "0123")
	o = habboAt(1, 0, 0, 3, 0)
	if steps := walkAll(t, stairs, []*room.Occupant{o}, o); len(steps) != 3 {
		t.Errorf("climbed %v, want 3 steps of 1", steps)
	}
	if o.Height != 3 {
		t.Errorf("stands at height %v, want 3", o.Height)
	}
}

// Other habbos block their tiles: a habbo walks around one, and never onto one's tile.
func TestHabbosWalkAroundEachOther(t *testing.T) {
	floor := floorOf(t, "", "00000", "00000", "00000")
	o, other := habboAt(1, 0, 1, 4, 1), habboAt(2, 2, 1, 2, 1)
	all := []*room.Occupant{o, other}
	steps := walkAll(t, floor, all, o)
	if len(steps) != 4 || o.X != 4 || o.Y != 1 {
		t.Errorf("walked %v, want 4 steps to 4,1", steps)
	}
	for _, s := range steps {
		if s == (tile{2, 1}) {
			t.Errorf("stepped onto the other habbo: %v", steps)
		}
	}

	o.GoalX, o.GoalY = 2, 1
	if _, ok := nextStep(floor, all, o); ok {
		t.Error("a way leads onto the other habbo's tile")
	}
}

// A seat takes a habbo only as its goal; on it, the habbo sits facing the seat's way, as Holo sat it.
func TestAHabboSitsOnTheSeatItWalksTo(t *testing.T) {
	floor := floorOf(t, "c1 chair 1 0 0 4 2", "000", "000", "000")
	o := habboAt(1, 0, 0, 2, 0)
	steps := walkAll(t, floor, []*room.Occupant{o}, o)
	if len(steps) != 4 || o.X != 2 || o.Y != 0 {
		t.Errorf("walked %v, want 4 steps around the seat to 2,0", steps)
	}
	for _, s := range steps {
		if s == (tile{1, 0}) {
			t.Errorf("walked over the seat: %v", steps)
		}
	}

	o = habboAt(1, 0, 0, 1, 0)
	o.Statuses = []room.Status{{Action: "dance", Parameters: "1"}}
	walkAll(t, floor, []*room.Occupant{o}, o)
	if o.X != 1 || o.Y != 0 || o.BodyDirection != 4 || o.HeadDirection != 4 {
		t.Errorf("stopped at %d,%d facing %d and %d, want on the seat facing 4", o.X, o.Y, o.HeadDirection, o.BodyDirection)
	}
	if len(o.Statuses) != 1 || o.Statuses[0] != (room.Status{Action: "sit", Parameters: "1"}) {
		t.Errorf("statuses %+v, want sit 1 alone", o.Statuses)
	}

	o.GoalX, o.GoalY = 0, 0
	o.Walking = true
	sent := walk(floor, []*room.Occupant{o}, o)
	if len(sent.Statuses) != 1 || sent.Statuses[0].Action != "mv" {
		t.Errorf("standing up sent %+v, want mv alone", sent.Statuses)
	}
}

// The status a step sends stands where the habbo was, with mv to where it goes, which the client animates.
func TestAStepSendsWhereTheHabboStandsAndWhereItGoes(t *testing.T) {
	floor := floorOf(t, "", "0000")
	o := habboAt(1, 0, 0, 3, 0)
	o.Walking = true
	sent := walk(floor, []*room.Occupant{o}, o)
	if sent.X != 0 || sent.BodyDirection != 2 || len(sent.Statuses) != 1 || sent.Statuses[0] != (room.Status{Action: "mv", Parameters: "1,0,0"}) {
		t.Errorf("sent %+v, want at 0,0 facing east with mv 1,0,0", sent)
	}
	if o.X != 1 {
		t.Errorf("the habbo is at %d, want 1", o.X)
	}
}

func TestDirectionsCountClockwiseFromNorth(t *testing.T) {
	for _, c := range []struct{ x, y, want int }{
		{5, 3, 0}, {6, 3, 1}, {6, 5, 2}, {9, 9, 3}, {5, 9, 4}, {1, 9, 5}, {1, 5, 6}, {4, 4, 7},
	} {
		if got := direction(5, 5, c.x, c.y); got != c.want {
			t.Errorf("direction to %d,%d = %d, want %d", c.x, c.y, got, c.want)
		}
	}
}
