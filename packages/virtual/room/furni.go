package room

import (
	"cmp"
	"maps"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
)

// Furni is a piece of furni that stands in a loaded room, with what it is.
type Furni struct {
	store.Furni
	Definition store.FurniDefinition
}

// doorOpen is the state of a door furni that lets habbos through, as the client's door classes set it.
const doorOpen = "O"

// aboveRug is how far above a rug the furni placed on it stands, as Holo had it.
const aboveRug = 0.1

// Tiles returns the tiles a floor furni covers, from its own tile on: its length runs along x when it faces north or
// south, and along y when it faces east or west, 2 or 6, as Holo laid furni.
func (f Furni) Tiles() [][2]int {
	alongX, alongY := int(f.Definition.Length), int(f.Definition.Width)
	if f.Direction == 2 || f.Direction == 6 {
		alongX, alongY = alongY, alongX
	}
	tiles := make([][2]int, 0, alongX*alongY)
	for x := range alongX {
		for y := range alongY {
			tiles = append(tiles, [2]int{int(f.X) + x, int(f.Y) + y})
		}
	}
	return tiles
}

// with returns the floor with the furni on it. On each tile the highest furni decides, and of two as high the newer
// one: a solid blocks the tile, unless it is a door that stands open; a seat and a bed take a habbo at their top,
// facing their way; and a rug leaves the tile open, at the rug's own height. More furni stands on a solid that has a
// height, at its top, and on a rug, just above it; nothing stands on a seat, a bed or a solid with no height, as Holo
// stacked furni. Wall items and tiles off the map change nothing.
func (f Floor) with(items []Furni) Floor {
	rows := make([][]Tile, len(f.rows))
	for y, row := range f.rows {
		rows[y] = slices.Clone(row)
	}
	lowestFirst := slices.SortedFunc(slices.Values(items), func(a, b Furni) int {
		return cmp.Or(cmp.Compare(a.Altitude, b.Altitude), cmp.Compare(a.ID, b.ID))
	})
	for _, item := range lowestFirst {
		d := item.Definition
		if d.Kind == "wall" {
			continue
		}
		for _, at := range item.Tiles() {
			x, y := at[0], at[1]
			if y < 0 || y >= len(rows) || x < 0 || x >= len(rows[y]) {
				continue
			}
			t := &rows[y][x]
			t.Direction = 0
			switch d.Kind {
			case "seat":
				t.State, t.Direction, t.Level, t.Placeable = Seat, int(item.Direction), item.Altitude+d.Height, false
			case "bed":
				t.State, t.Direction, t.Level, t.Placeable = Bed, int(item.Direction), item.Altitude+d.Height, false
			case "rug":
				t.State, t.Level, t.Top = Open, item.Altitude, item.Altitude+aboveRug
			default:
				if d.Door && item.State == doorOpen {
					t.State, t.Level = Open, float64(t.Height)
				} else {
					t.State = Blocked
				}
				if d.Height > 0 {
					t.Top = item.Altitude + d.Height
				} else {
					t.Placeable = false
				}
			}
		}
	}
	return Floor{rows: rows}
}

// Furni returns the furni that stands in the room, by id.
func (r *Room) Furni() []Furni {
	r.mu.Lock()
	defer r.mu.Unlock()
	return sortedFurni(r.furni)
}

func sortedFurni(byID map[int64]Furni) []Furni {
	return slices.SortedFunc(maps.Values(byID), func(a, b Furni) int { return cmp.Compare(a.ID, b.ID) })
}

// WithDefinitions pairs the rows of furni with what each is, from virtual/furni. A row whose definition an update
// added since the server loaded them is left out.
func WithDefinitions(rows []store.Furni) []Furni {
	items := make([]Furni, 0, len(rows))
	for _, row := range rows {
		if d, ok := furni.Get(row.FurniDefinitionID); ok {
			items = append(items, Furni{Furni: row, Definition: d})
		}
	}
	return items
}

// FurniByID returns the furni id that stands in the room.
func (r *Room) FurniByID(id int64) (Furni, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	item, ok := r.furni[id]
	return item, ok
}

// FloorWithout returns the room's floor as it would be without the furni id: where that furni may move to.
func (r *Room) FloorWithout(id int64) Floor {
	r.mu.Lock()
	defer r.mu.Unlock()
	others := maps.Clone(r.furni)
	delete(others, id)
	return r.bare.with(sortedFurni(others))
}

// SetFurni stands item in the room's copy, in place of the furni of its id if the room has one, once the store has
// the change (plans/server decision 0010), and reports whether it did.
func (r *Room) SetFurni(item Furni) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.unloaded {
		return false
	}
	r.furni[item.ID] = item
	r.floor = r.bare.with(sortedFurni(r.furni))
	return true
}

// RemoveFurni takes the furni id out of the room's copy, once the store has the change, and returns it as it stood.
func (r *Room) RemoveFurni(id int64) (Furni, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	item, ok := r.furni[id]
	if r.unloaded || !ok {
		return Furni{}, false
	}
	delete(r.furni, id)
	r.floor = r.bare.with(sortedFurni(r.furni))
	return item, true
}

// Furnish runs change while no other change to the room's furni runs, so that two habbos never place, move or pick
// up furni at once: each sees the room as the one before left it. It holds no other lock, so change may read the room
// and write the store.
func (r *Room) Furnish(change func() error) error {
	r.furnishing.Lock()
	defer r.furnishing.Unlock()
	return change()
}
