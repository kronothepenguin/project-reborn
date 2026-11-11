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
// facing their way; and a rug leaves the tile open, at the rug's own height. Wall items and tiles off the map change
// nothing.
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
				t.State, t.Direction, t.Level = Seat, int(item.Direction), item.Altitude+d.Height
			case "bed":
				t.State, t.Direction, t.Level = Bed, int(item.Direction), item.Altitude+d.Height
			case "rug":
				t.State, t.Level = Open, item.Altitude
			default:
				if d.Door && item.State == doorOpen {
					t.State, t.Level = Open, float64(t.Height)
				} else {
					t.State = Blocked
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
