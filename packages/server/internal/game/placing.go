package game

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// FurniPlaced tells the habbos in a room that a furni now stands in it, FurniMoved that a floor furni stands
// elsewhere or turned, and FurniRemoved that a furni left the room.
type (
	FurniPlaced  struct{ Furni room.Furni }
	FurniMoved   struct{ Furni room.Furni }
	FurniRemoved struct {
		ID   int64
		Wall bool
	}
)

// wallPosition is a wall item's place as the client writes it: the wall's tile, the place on it, and the left or
// the right wall.
var wallPosition = regexp.MustCompile(`^:w=(\d{1,3}),(\d{1,3}) l=(\d{1,3}),(\d{1,3}) ([lr])$`)

// furnished returns the habbo room viewer is in, when viewer may place and move furni there: its owner, a habbo with
// rights in it, or a holder of fuse_any_room_controller (decision server/0103).
func furnished(viewer habbo.Habbo) (*room.Room, bool) {
	r, ok := room.In(viewer.ID)
	if !ok || !controls(r, viewer) {
		return nil, false
	}
	return r, true
}

// PlaceFurni stands the floor furni id of viewer's hand on the tile x, y of the room it is in, turned to direction,
// and reports whether it did. The furni must fit there (fit), and the room must hold fewer than game.maxRoomFurni
// (decision server/0104). The row is written before the room's copy changes (decision server/0010).
func PlaceFurni(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64, x, y, direction int) (bool, error) {
	r, ok := furnished(viewer)
	if !ok || direction < 0 || direction > 7 {
		return false, nil
	}
	placed := false
	err := r.Furnish(func() error {
		item, ok, err := fromHand(ctx, db, r, viewer, id)
		if err != nil || !ok || item.Definition.Kind == "wall" {
			return err
		}
		item.X, item.Y, item.Direction = int64(x), int64(y), int64(direction)
		if item.Altitude, ok = fit(r.Floor(), standing(r), item, false, settings.Int(ctx, store.New(db), "game.maxStackHeight")); !ok {
			return nil
		}
		if placed, err = stand(ctx, db, r, viewer, item); err != nil || !placed {
			return err
		}
		settle(r, item.Tiles())
		return nil
	})
	return placed, err
}

// PlaceWallItem hangs the wall item id of viewer's hand at position on a wall of the room it is in, and reports
// whether it did. A wallpaper, a floor or a landscape is never hung, and a pad of post-its is not either: one of its
// notes is (hangPostIt).
func PlaceWallItem(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64, position string) (bool, error) {
	r, ok := furnished(viewer)
	at := wallPosition.FindStringSubmatch(position)
	if !ok || at == nil {
		return false, nil
	}
	for _, n := range at[1:5] {
		// Holo let a wall item no further than 200 along a wall.
		if len(n) == 3 && n > "200" {
			return false, nil
		}
	}
	placed := false
	err := r.Furnish(func() error {
		item, ok, err := fromHand(ctx, db, r, viewer, id)
		sprite := item.Definition.Sprite
		if err != nil || !ok || item.Definition.Kind != "wall" || furni.IsDecoration(sprite) {
			return err
		}
		if isPostIt(item) {
			placed, err = hangPostIt(ctx, db, r, viewer, item, position)
			return err
		}
		item.WallPosition = position
		placed, err = stand(ctx, db, r, viewer, item)
		return err
	})
	return placed, err
}

// fromHand reads the furni id from the store while viewer's hand holds it and the room takes one more. A furni on
// offer in a trade stays in the hand (decision server/0114).
func fromHand(ctx context.Context, db *sql.DB, r *room.Room, viewer habbo.Habbo, id int64) (room.Furni, bool, error) {
	q := store.New(db)
	if len(r.Furni()) >= settings.Int(ctx, q, "game.maxRoomFurni") || onOffer(viewer, id) {
		return room.Furni{}, false, nil
	}
	row, err := q.GetFurni(ctx, id)
	if store.IsNotFound(err) {
		return room.Furni{}, false, nil
	}
	if err != nil {
		return room.Furni{}, false, fmt.Errorf("game: place furni: %w", err)
	}
	d, ok := furni.Get(row.FurniDefinitionID)
	if !ok || row.AvatarID.Int64 != viewer.ID || !row.AvatarID.Valid {
		return room.Furni{}, false, nil
	}
	return room.Furni{Furni: row, Definition: d}, true, nil
}

// stand writes item into the room, out of viewer's hand, and then into the room's copy, and tells the room.
func stand(ctx context.Context, db *sql.DB, r *room.Room, viewer habbo.Habbo, item room.Furni) (bool, error) {
	n, err := store.New(db).PlaceFurni(ctx, store.PlaceFurniParams{
		ID: item.ID, AvatarID: viewer.ID, RoomID: r.Ref().ID,
		X: item.X, Y: item.Y, Altitude: item.Altitude, Direction: item.Direction, WallPosition: item.WallPosition,
	})
	if err != nil {
		return false, fmt.Errorf("game: place furni: %w", err)
	}
	if n == 0 {
		return false, nil
	}
	item.AvatarID = sql.NullInt64{}
	item.RoomID = sql.NullInt64{Int64: r.Ref().ID, Valid: true}
	if !r.SetFurni(item) {
		return false, nil
	}
	broadcast(r, FurniPlaced{Furni: item})
	return true, nil
}

// MoveFurni moves the floor furni id of the room viewer is in to the tile x, y, turned to direction, and returns the
// furni as it stands after, moved or not: a furni that does not fit there stays, and its mover's client puts it back.
// It reports false for a furni the room does not have, or a habbo that may not move it. A seat may come under a
// habbo, which then sits, as Holo had it.
func MoveFurni(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64, x, y, direction int) (room.Furni, bool, error) {
	r, ok := furnished(viewer)
	if !ok {
		return room.Furni{}, false, nil
	}
	var item room.Furni
	found := false
	err := r.Furnish(func() error {
		if item, found = r.FurniByID(id); !found || item.Definition.Kind == "wall" {
			found = false
			return nil
		}
		moved := item
		moved.X, moved.Y, moved.Direction = int64(x), int64(y), int64(direction)
		altitude, ok := fit(r.FloorWithout(id), standing(r), moved, moved.Definition.Kind == "seat", settings.Int(ctx, store.New(db), "game.maxStackHeight"))
		if !ok || direction < 0 || direction > 7 {
			return nil
		}
		moved.Altitude = altitude
		n, err := store.New(db).MoveFurni(ctx, store.MoveFurniParams{ID: id, RoomID: r.Ref().ID, X: moved.X, Y: moved.Y, Altitude: altitude, Direction: moved.Direction})
		if err != nil {
			return fmt.Errorf("game: move furni: %w", err)
		}
		if n == 0 || !r.SetFurni(moved) {
			return nil
		}
		broadcast(r, FurniMoved{Furni: moved})
		settle(r, append(item.Tiles(), moved.Tiles()...))
		item = moved
		return nil
	})
	return item, found, err
}

// PickUpFurni takes the furni id out of the room viewer is in and into viewer's hand, and reports whether it did.
// Only the room's owner or a holder of fuse_any_room_controller picks furni up, and what it picks up becomes its
// user's, whoever placed it (decision server/0103). A post-it is never picked up.
func PickUpFurni(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64) (bool, error) {
	r, ok := room.In(viewer.ID)
	if !ok || r.Ref().Public || !owns(r, viewer) {
		return false, nil
	}
	picked := false
	err := r.Furnish(func() error {
		item, ok := r.FurniByID(id)
		if !ok || isPostIt(item) {
			return nil
		}
		n, err := store.New(db).PickUpFurni(ctx, store.PickUpFurniParams{ID: id, RoomID: r.Ref().ID, UserID: viewer.UserID, AvatarID: viewer.ID})
		if err != nil {
			return fmt.Errorf("game: pick up furni: %w", err)
		}
		if n == 0 {
			return nil
		}
		if _, picked = r.RemoveFurni(id); !picked {
			return nil
		}
		broadcast(r, FurniRemoved{ID: id, Wall: item.Definition.Kind == "wall"})
		if item.Definition.Kind != "wall" {
			settle(r, item.Tiles())
		}
		return nil
	})
	return picked, err
}

// standing returns the tiles the room's habbos stand on.
func standing(r *room.Room) map[[2]int]bool {
	held := map[[2]int]bool{}
	for _, o := range r.Occupants() {
		held[[2]int{o.X, o.Y}] = true
	}
	return held
}

// fit tells how high the floor furni item would stand on floor, and whether it may stand there at all, by Holo's
// rules. Every tile it covers must take furni: one the model allows, with nothing on it, a solid that has a height,
// or a rug; and none may hold a habbo, unless underHabbos, for a seat that is moved. The furni stands on the highest
// thing under it, or on the floor of its own tile, and never higher than ceiling, game.maxStackHeight.
func fit(floor room.Floor, habbos map[[2]int]bool, item room.Furni, underHabbos bool, ceiling int) (float64, bool) {
	own, ok := floor.At(int(item.X), int(item.Y))
	if !ok {
		return 0, false
	}
	altitude := float64(own.Height)
	for _, at := range item.Tiles() {
		t, ok := floor.At(at[0], at[1])
		if !ok || !t.Placeable || (habbos[at] && !underHabbos) {
			return 0, false
		}
		altitude = max(altitude, t.Top)
	}
	return min(altitude, float64(ceiling)), true
}

// settle puts the habbos that stand still on tiles as the floor now has them: sitting on a seat, lying on a bed, or
// standing at the tile's height. The room's clock sends their statuses.
func settle(r *room.Room, tiles [][2]int) {
	floor := r.Floor()
	for _, o := range r.Occupants() {
		if !slices.Contains(tiles, [2]int{o.X, o.Y}) {
			continue
		}
		r.Update(o.AvatarID, func(o *room.Occupant) {
			t, ok := floor.At(o.X, o.Y)
			if !ok || o.Walking || !slices.Contains(tiles, [2]int{o.X, o.Y}) {
				return
			}
			o.Statuses = without(o.Statuses, "sit", "lay")
			o.Height = float64(t.Height)
			if t.State == room.Open {
				o.Height = t.Level
			}
			if action, ok := restsOn[t.State]; ok {
				o.Statuses = without(o.Statuses, "dance")
				o.HeadDirection, o.BodyDirection = t.Direction, t.Direction
				o.Statuses = append(o.Statuses, room.Status{Action: action, Parameters: level(t.Level)})
			}
			o.Changed = true
		})
	}
}
