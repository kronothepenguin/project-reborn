package room

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// TileState is what a tile lets a habbo do.
type TileState int

const (
	// Open tiles take a habbo.
	Open TileState = iota
	// Blocked tiles take none: a wall, a hole, or a public room's solid furni.
	Blocked
	// Seat tiles take a habbo, who sits facing the seat's direction.
	Seat
)

// Tile is a square of a room's floor.
type Tile struct {
	State TileState
	// Height is the floor's height, 0 to 9.
	Height int
	// Placeable reports whether furni may stand on the tile.
	Placeable bool
	// Direction is a seat's: the way a habbo sitting on it faces.
	Direction int
}

// Floor is a room's floor: its model's height map, with the model's public furni on it. A floor never changes once
// parsed, so it may be read from several goroutines at once.
type Floor struct {
	rows [][]Tile
}

// At returns the tile at x, y, and false off the map.
func (f Floor) At(x, y int) (Tile, bool) {
	if y < 0 || y >= len(f.rows) || x < 0 || x >= len(f.rows[y]) {
		return Tile{}, false
	}
	return f.rows[y][x], true
}

// ParseFloor reads a model's floor. Its height map has a row per line and a character per tile, read as the client
// reads 31 (hh_room's Room Geometry Class): x is blocked, in either case as Lingo compares; a digit is that height;
// A to H are the heights 0 to 7 and y the height 0, where nothing may be placed; and any other character, such as the
// theater's O, is open at the height 0, as Holo read it. Empty lines are skipped, as the client skips them. Each line
// of the public items is `<id> <class> <x> <y> <height> <direction> <state>`, the state 1 for a blocked tile and 2 for
// a seat; Holo's data has lines with an eighth field, which nothing reads. The door's tile is always open, at the
// door's height, as Holo had it.
func ParseFloor(m store.RoomModel) (Floor, error) {
	var f Floor
	for line := range strings.SplitSeq(m.Heightmap, "\n") {
		if line == "" {
			continue
		}
		row := make([]Tile, 0, len(line))
		for _, c := range []byte(line) {
			row = append(row, tileOf(c))
		}
		f.rows = append(f.rows, row)
	}

	for n, line := range strings.Split(m.PublicItems, "\n") {
		if line == "" {
			continue
		}
		if err := f.place(line); err != nil {
			return Floor{}, fmt.Errorf("model %s, public item %d %q: %w", m.Name, n+1, line, err)
		}
	}

	x, y := int(m.DoorX), int(m.DoorY)
	if _, ok := f.At(x, y); !ok {
		return Floor{}, fmt.Errorf("model %s: the door %d,%d is off the height map", m.Name, x, y)
	}
	f.rows[y][x] = Tile{State: Open, Height: int(m.DoorHeight)}
	return f, nil
}

func tileOf(c byte) Tile {
	switch {
	case c == 'x' || c == 'X':
		return Tile{State: Blocked}
	case c >= '0' && c <= '9':
		return Tile{Height: int(c - '0'), Placeable: true}
	case c >= 'A' && c <= 'H':
		return Tile{Height: int(c - 'A')}
	default:
		return Tile{}
	}
}

func (f *Floor) place(line string) error {
	fields := strings.Split(line, " ")
	if len(fields) < 7 {
		return fmt.Errorf("%d fields, want 7", len(fields))
	}
	var n [3]int
	for i, field := range []string{fields[2], fields[3], fields[5]} {
		v, err := strconv.Atoi(field)
		if err != nil {
			return err
		}
		n[i] = v
	}
	x, y, direction := n[0], n[1], n[2]
	if _, ok := f.At(x, y); !ok {
		return fmt.Errorf("the tile %d,%d is off the height map", x, y)
	}
	switch fields[6] {
	case "1":
		f.rows[y][x].State = Blocked
	case "2":
		f.rows[y][x].State = Seat
		f.rows[y][x].Direction = direction
	default:
		return fmt.Errorf("the state %q, want 1 or 2", fields[6])
	}
	return nil
}
