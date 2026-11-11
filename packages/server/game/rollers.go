package game

import (
	"context"
	"database/sql"
	"fmt"
	"maps"
	"slices"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// rollTime is how often rollers carry what stands on them (plans/server decision 0107).
const rollTime = 2 * time.Second

// FurniRolled tells a room that a roller carried what stood on it from its tile to the next: each furni from its
// altitude to its new one, and the habbo that rode it, if one did.
type FurniRolled struct {
	Roller       int64
	FromX, FromY int
	ToX, ToY     int
	Furni        []RolledFurni
	Rider        *RolledRider
}

// RolledFurni is a furni a roller carried, with its altitude before and after.
type RolledFurni struct {
	ID       int64
	From, To float64
}

// RolledRider is the habbo a roller carried, by its index in the room, with its height before and after.
type RolledRider struct {
	Index    int
	From, To float64
}

// roll lets every roller of the room carry what stands on it one tile the way the roller points, by the rules the
// real hotel's rollers had (plans/server decision 0107):
//
//   - a roller carries the furni of one tile that stand on it, and the habbo that stands still on it, together;
//   - the next tile must be on the floor and take what comes: no habbo on it, and no furni but a roller, onto which
//     things land at its top; furni needs a tile the model lets furni stand on;
//   - a roller ahead moves its load first, so that a line of rollers passes a row of things along in one go;
//   - what cannot move stays, and tries again the next time.
//
// Each furni's new place is saved before the room's copy changes (plans/server decision 0010).
func roll(ctx context.Context, db *sql.DB, r *room.Room) error {
	return r.Furnish(func() error {
		rollers := map[[2]int]room.Furni{}
		loads := map[[2]int][]room.Furni{}
		taken := map[[2]int]bool{}
		items := r.Furni()
		for _, item := range items {
			if item.Definition.Kind == "roller" {
				at := [2]int{int(item.X), int(item.Y)}
				if top, ok := rollers[at]; !ok || item.Altitude > top.Altitude {
					rollers[at] = item
				}
			}
		}
		if len(rollers) == 0 {
			return nil
		}
		for _, item := range items {
			if item.Definition.Kind == "wall" || item.Definition.Kind == "roller" {
				continue
			}
			tiles := item.Tiles()
			for _, at := range tiles {
				taken[at] = true
			}
			if roller, ok := rollers[tiles[0]]; ok && len(tiles) == 1 && item.Altitude >= top(roller) {
				loads[tiles[0]] = append(loads[tiles[0]], item)
			}
		}
		riders := map[[2]int]room.Occupant{}
		held := map[[2]int]bool{}
		for _, o := range r.Occupants() {
			at := [2]int{o.X, o.Y}
			held[at] = true
			if !o.Walking {
				riders[at] = o
			}
		}

		bare := r.BareFloor()
		done := map[[2]int]bool{}
		var carry func(at [2]int) error
		carry = func(at [2]int) error {
			if done[at] {
				return nil
			}
			done[at] = true
			roller := rollers[at]
			step := directions[roller.Direction%8]
			next := [2]int{at[0] + step.x, at[1] + step.y}
			ahead, rollerAhead := rollers[next]
			if rollerAhead {
				if err := carry(next); err != nil {
					return err
				}
			}
			load, rider := loads[at], riders[at]
			_, ridden := riders[at]
			if len(load) == 0 && !ridden {
				return nil
			}
			to, ok := bare.At(next[0], next[1])
			if !ok || to.State == room.Blocked || taken[next] || held[next] || (len(load) > 0 && !to.Placeable) {
				return nil
			}
			from, landing := top(roller), float64(to.Height)
			if rollerAhead {
				landing = top(ahead)
			}
			rolled := FurniRolled{Roller: roller.ID, FromX: at[0], FromY: at[1], ToX: next[0], ToY: next[1]}
			q := store.New(db)
			for _, item := range load {
				moved := item
				moved.X, moved.Y, moved.Altitude = int64(next[0]), int64(next[1]), landing+item.Altitude-from
				n, err := q.MoveFurni(ctx, store.MoveFurniParams{ID: item.ID, RoomID: r.Ref().ID, X: moved.X, Y: moved.Y, Altitude: moved.Altitude, Direction: moved.Direction})
				if err != nil {
					return fmt.Errorf("game: roll: %w", err)
				}
				if n == 0 || !r.SetFurni(moved) {
					continue
				}
				rolled.Furni = append(rolled.Furni, RolledFurni{ID: item.ID, From: item.Altitude, To: moved.Altitude})
				taken[next] = true
			}
			if len(rolled.Furni) == len(load) {
				delete(taken, at)
			}
			if ridden {
				level := landing
				if t, ok := r.Floor().At(next[0], next[1]); ok && t.State != room.Open {
					level = float64(t.Height)
				}
				r.Update(rider.AvatarID, func(o *room.Occupant) {
					if o.Walking || o.X != at[0] || o.Y != at[1] {
						return
					}
					rolled.Rider = &RolledRider{Index: o.Index, From: o.Height, To: level}
					o.X, o.Y, o.Height = next[0], next[1], level
				})
				if rolled.Rider != nil {
					delete(held, at)
					held[next] = true
				}
			}
			if len(rolled.Furni) == 0 && rolled.Rider == nil {
				return nil
			}
			broadcast(r, rolled)
			settle(r, [][2]int{at, next})
			return nil
		}
		// By tile, so that the same rollers always move in the same order.
		for _, at := range slices.SortedFunc(maps.Keys(rollers), func(a, b [2]int) int {
			if a[1] != b[1] {
				return a[1] - b[1]
			}
			return a[0] - b[0]
		}) {
			if err := carry(at); err != nil {
				return err
			}
		}
		return nil
	})
}

// top is how high what stands on a roller stands.
func top(roller room.Furni) float64 {
	return roller.Altitude + roller.Definition.Height
}
