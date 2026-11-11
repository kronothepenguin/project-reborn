package room

import (
	"database/sql"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
)

func piece(id int64, kind string, x, y int64, altitude float64, direction int64) Furni {
	return Furni{
		Furni:      store.Furni{ID: id, X: x, Y: y, Altitude: altitude, Direction: direction},
		Definition: store.FurniDefinition{Kind: kind, Length: 1, Width: 1, Height: 1},
	}
}

func bareFloor(t *testing.T) Floor {
	t.Helper()
	f, err := ParseFloor(store.RoomModel{Name: "test", Heightmap: "0000\n0000\n0000\n1111", DoorX: 0, DoorY: 0})
	if err != nil {
		t.Fatal(err)
	}
	return f
}

// A furni's length runs along x when it faces north or south, and along y when it faces east or west.
func TestAFurniCoversTilesByItsDirection(t *testing.T) {
	bed := piece(1, "bed", 1, 0, 0, 0)
	bed.Definition.Length, bed.Definition.Width = 2, 3
	if got := bed.Tiles(); !slices.Equal(got, [][2]int{{1, 0}, {1, 1}, {1, 2}, {2, 0}, {2, 1}, {2, 2}}) {
		t.Errorf("facing north the bed covers %v, want 2 tiles along x and 3 along y", got)
	}
	bed.Direction = 2
	if got := bed.Tiles(); !slices.Equal(got, [][2]int{{1, 0}, {1, 1}, {2, 0}, {2, 1}, {3, 0}, {3, 1}}) {
		t.Errorf("facing east the bed covers %v, want 3 tiles along x and 2 along y", got)
	}
}

func TestFurniShapesTheFloor(t *testing.T) {
	gate := piece(5, "solid", 3, 1, 0, 0)
	gate.Definition.Door, gate.State = true, "O"
	shut := piece(6, "solid", 3, 2, 0, 0)
	shut.Definition.Door, shut.State = true, "C"
	poster := piece(7, "wall", 0, 2, 0, 0)
	off := piece(8, "solid", 9, 9, 0, 0)
	f := bareFloor(t).with([]Furni{
		piece(1, "solid", 1, 0, 0, 0),
		piece(2, "seat", 2, 0, 0, 4),
		piece(3, "bed", 0, 1, 0, 2),
		piece(4, "rug", 1, 1, 0, 0),
		gate, shut, poster, off,
		piece(9, "seat", 0, 3, 1, 6),
	})
	for _, want := range []struct {
		x, y int
		tile Tile
	}{
		{1, 0, Tile{State: Blocked, Placeable: true}},
		{2, 0, Tile{State: Seat, Direction: 4, Level: 1, Placeable: true}},
		{0, 1, Tile{State: Bed, Direction: 2, Level: 1, Placeable: true}},
		{1, 1, Tile{State: Open, Placeable: true}},
		{3, 1, Tile{State: Open, Placeable: true}},
		{3, 2, Tile{State: Blocked, Placeable: true}},
		{0, 2, Tile{State: Open, Placeable: true}},
		{0, 3, Tile{State: Seat, Direction: 6, Height: 1, Level: 2, Placeable: true}},
	} {
		if got, _ := f.At(want.x, want.y); got != want.tile {
			t.Errorf("At(%d, %d) = %+v, want %+v", want.x, want.y, got, want.tile)
		}
	}
	if bare, _ := bareFloor(t).At(1, 0); bare.State != Open {
		t.Error("laying furni on a floor changed the floor it was laid on")
	}
}

// The highest furni on a tile decides what the tile is, and of two as high the newer one.
func TestTheHighestFurniDecidesATile(t *testing.T) {
	table := piece(1, "solid", 1, 1, 0, 0)
	rug := piece(2, "rug", 1, 1, 1, 0)
	if tile, _ := bareFloor(t).with([]Furni{rug, table}).At(1, 1); tile.State != Open || tile.Level != 1 {
		t.Errorf("a rug on a table leaves the tile %+v, want open at the rug's height", tile)
	}
	chair := piece(3, "seat", 2, 2, 0, 2)
	lamp := piece(4, "solid", 2, 2, 0, 0)
	if tile, _ := bareFloor(t).with([]Furni{lamp, chair}).At(2, 2); tile.State != Blocked || tile.Direction != 0 {
		t.Errorf("a lamp as high as a chair, and newer, leaves the tile %+v, want blocked", tile)
	}
}

// A habbo room loads the furni that stands in it, and nothing of its owner's hand.
func TestAHabboRoomLoadsItsFurni(t *testing.T) {
	db := openHotel(t)
	if err := furni.Load(t.Context(), db); err != nil {
		t.Fatal(err)
	}
	ctx := t.Context()
	q := store.New(db)
	now := time.Now().UTC()
	owner := newHabbo(t, q, "Owner")
	avatar := must[store.Avatar](t)(q.GetAvatar(ctx, owner))
	flat := must[store.Room](t)(q.CreateRoom(ctx, store.CreateRoomParams{AvatarID: owner, RoomCategoryID: 2, RoomModelID: 1, Name: "Flat", Door: "open", ShowOwner: true, CreatedAt: now}))
	hand := sql.NullInt64{Int64: owner, Valid: true}
	chair := must[store.Furni](t)(q.CreateFurni(ctx, store.CreateFurniParams{FurniDefinitionID: 463, UserID: avatar.UserID, AvatarID: hand, CreatedAt: now}))
	poster := must[store.Furni](t)(q.CreateFurni(ctx, store.CreateFurniParams{FurniDefinitionID: 105, UserID: avatar.UserID, AvatarID: hand, CreatedAt: now}))
	must[store.Furni](t)(q.CreateFurni(ctx, store.CreateFurniParams{FurniDefinitionID: 465, UserID: avatar.UserID, AvatarID: hand, CreatedAt: now}))
	for _, placed := range []string{
		`UPDATE furni SET avatar_id = NULL, room_id = ?, x = 6, y = 6, direction = 2 WHERE id = ?`,
		`UPDATE furni SET avatar_id = NULL, room_id = ?, wall_position = ':w=3,2 l=9,63 l' WHERE id = ?`,
	} {
		id := chair.ID
		if strings.Contains(placed, "wall_position") {
			id = poster.ID
		}
		if _, err := db.ExecContext(ctx, placed, flat.ID, id); err != nil {
			t.Fatal(err)
		}
	}

	ann := &session{"Ann"}
	r, _, _, err := Enter(ctx, db, Ref{ID: flat.ID}, owner, ann, 0)
	if err != nil {
		t.Fatal(err)
	}
	defer leave(t, owner, ann)
	items := r.Furni()
	if len(items) != 2 || items[0].ID != chair.ID || items[0].Definition.Sprite != "rclr_chair" || items[1].ID != poster.ID || items[1].WallPosition != ":w=3,2 l=9,63 l" {
		t.Fatalf("the room's furni = %+v, want the chair and the poster", items)
	}
	if tile, _ := r.Floor().At(6, 6); tile.State != Seat || tile.Direction != 2 || tile.Level != 1 {
		t.Errorf("the chair's tile = %+v, want a seat facing east, 1 high", tile)
	}
	if tile, _ := r.Floor().At(7, 6); tile.State != Open {
		t.Errorf("the tile beside the chair = %+v, want open", tile)
	}
}
