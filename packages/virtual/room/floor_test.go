package room

import (
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// The client reads x in either case as blocked, a digit as its height, A to H as the heights 0 to 7 and y as 0 where
// nothing may be placed, and skips empty lines; Holo read any other character as open at 0, and opened the door.
func TestTheFloorReadsTheHeightMapAsTheClientDoes(t *testing.T) {
	f, err := ParseFloor(store.RoomModel{Name: "test", Heightmap: "xX09\nAHyO\n\n1234", DoorX: 0, DoorY: 0, DoorHeight: 2})
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []struct {
		x, y int
		tile Tile
	}{
		{0, 0, Tile{State: Open, Height: 2}},
		{1, 0, Tile{State: Blocked}},
		{2, 0, Tile{Height: 0, Placeable: true}},
		{3, 0, Tile{Height: 9, Placeable: true}},
		{0, 1, Tile{Height: 0}},
		{1, 1, Tile{Height: 7}},
		{2, 1, Tile{Height: 0}},
		{3, 1, Tile{Height: 0}},
		{3, 2, Tile{Height: 4, Placeable: true}},
	} {
		if got, ok := f.At(want.x, want.y); !ok || got != want.tile {
			t.Errorf("At(%d, %d) = %+v, %t; want %+v", want.x, want.y, got, ok, want.tile)
		}
	}
	for _, off := range [][2]int{{-1, 0}, {4, 0}, {0, 3}, {0, -1}} {
		if _, ok := f.At(off[0], off[1]); ok {
			t.Errorf("At(%d, %d) is on the map", off[0], off[1])
		}
	}
}

func TestAPublicRoomsFurniBlocksAndSeats(t *testing.T) {
	f, err := ParseFloor(store.RoomModel{
		Name:        "test",
		Heightmap:   "0000\n0000\n0000",
		PublicItems: "a1 lamp 2 0 0 0 1\nb2 chair 3 0 0 4 2\n\nc3 chair 2 2 0 6 2 2",
	})
	if err != nil {
		t.Fatal(err)
	}
	if tile, _ := f.At(2, 0); tile.State != Blocked {
		t.Errorf("the lamp's tile is %+v, want blocked", tile)
	}
	if tile, _ := f.At(3, 0); tile.State != Seat || tile.Direction != 4 {
		t.Errorf("the chair's tile is %+v, want a seat facing 4", tile)
	}
	if tile, _ := f.At(2, 2); tile.State != Seat || tile.Direction != 6 {
		t.Errorf("the chair with an eighth field is on %+v, want a seat facing 6", tile)
	}
}

func TestABrokenFloorIsRefused(t *testing.T) {
	for name, m := range map[string]store.RoomModel{
		"an item without its state": {Heightmap: "00", PublicItems: "a1 lamp 1 0 0 0"},
		"an unknown state":          {Heightmap: "00", PublicItems: "a1 lamp 1 0 0 0 3"},
		"an item off the map":       {Heightmap: "00", PublicItems: "a1 lamp 2 0 0 0 1"},
		"a position not a number":   {Heightmap: "00", PublicItems: "a1 lamp one 0 0 0 1"},
		"a door off the map":        {Heightmap: "00", DoorX: 5},
	} {
		if _, err := ParseFloor(m); err == nil {
			t.Errorf("%s: parsed", name)
		}
	}
}

// Holo's data lists the public furni of eight models without their state, which no public room uses; every other
// model parses.
func TestTheSeededModelsParse(t *testing.T) {
	db, err := store.Open(filepath.Join(t.TempDir(), "hotel.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	models, err := store.New(db).ListRoomModels(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	var refused []string
	for _, m := range models {
		if _, err := ParseFloor(m); err != nil {
			if !strings.Contains(err.Error(), "fields, want 7") {
				t.Errorf("model %s: %v", m.Name, err)
			}
			refused = append(refused, m.Name)
		}
	}
	slices.Sort(refused)
	if want := []string{"cafe", "cinema", "den", "gardens", "rumble", "square_1", "square_2", "terace"}; !slices.Equal(refused, want) {
		t.Errorf("refused %v, want %v", refused, want)
	}
}
