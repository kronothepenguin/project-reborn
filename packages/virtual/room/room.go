// Package room holds the public rooms, which every player shares, loaded when the server starts and kept, and how
// many habbos are in each room, which lives only in memory (plans/server decisions 0009, 0011 and 0060).
package room

import (
	"context"
	"database/sql"
	"fmt"
	"slices"
	"sync"
	"sync/atomic"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type publicRooms struct {
	byID       map[int64]store.PublicRoom
	byCategory map[int64][]store.PublicRoom
}

var current atomic.Pointer[publicRooms]

// Load reads every public room from db, in place of the ones in memory.
func Load(ctx context.Context, db *sql.DB) error {
	rows, err := store.New(db).ListPublicRooms(ctx)
	if err != nil {
		return fmt.Errorf("room: %w", err)
	}
	p := &publicRooms{byID: make(map[int64]store.PublicRoom, len(rows)), byCategory: make(map[int64][]store.PublicRoom)}
	for _, r := range rows {
		p.byID[r.ID] = r
		p.byCategory[r.RoomCategoryID] = append(p.byCategory[r.RoomCategoryID], r)
	}
	current.Store(p)
	return nil
}

// Public returns the public room id.
func Public(id int64) (store.PublicRoom, bool) {
	p := current.Load()
	if p == nil {
		return store.PublicRoom{}, false
	}
	r, ok := p.byID[id]
	return r, ok
}

// PublicIn returns the public rooms of a category, by id.
func PublicIn(categoryID int64) []store.PublicRoom {
	p := current.Load()
	if p == nil {
		return nil
	}
	return slices.Clone(p.byCategory[categoryID])
}

// Ref names a room as the client does: a public room or a habbo room, whose ids may be equal.
type Ref struct {
	Public bool
	ID     int64
}

var (
	mu       sync.Mutex
	visitors = make(map[Ref]int)
)

// Visitors returns how many habbos are in the room.
func Visitors(r Ref) int {
	mu.Lock()
	defer mu.Unlock()
	return visitors[r]
}

// Enter counts one more habbo in the room.
func Enter(r Ref) {
	mu.Lock()
	defer mu.Unlock()
	visitors[r]++
}

// Leave counts one habbo less in the room, never below none.
func Leave(r Ref) {
	mu.Lock()
	defer mu.Unlock()
	if visitors[r] <= 1 {
		delete(visitors, r)
		return
	}
	visitors[r]--
}
