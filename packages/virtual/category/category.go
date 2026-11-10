// Package category holds the navigator's categories, which every player shares: loaded when the server starts, and
// kept (plans/server decisions 0009 and 0060).
package category

import (
	"cmp"
	"context"
	"database/sql"
	"fmt"
	"slices"
	"sync/atomic"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type tree struct {
	byID     map[int64]store.RoomCategory
	children map[int64][]store.RoomCategory
}

// Load swaps in a whole new tree, so a reader never sees half of one.
var current atomic.Pointer[tree]

// Load reads every category from db, in place of the ones in memory.
func Load(ctx context.Context, db *sql.DB) error {
	rows, err := store.New(db).ListRoomCategories(ctx)
	if err != nil {
		return fmt.Errorf("category: %w", err)
	}
	t := &tree{byID: make(map[int64]store.RoomCategory, len(rows)), children: make(map[int64][]store.RoomCategory)}
	for _, c := range rows {
		t.byID[c.ID] = c
		if c.ParentID.Valid {
			t.children[c.ParentID.Int64] = append(t.children[c.ParentID.Int64], c)
		}
	}
	current.Store(t)
	return nil
}

// Get returns the category id.
func Get(id int64) (store.RoomCategory, bool) {
	t := current.Load()
	if t == nil {
		return store.RoomCategory{}, false
	}
	c, ok := t.byID[id]
	return c, ok
}

// All returns every category, by id.
func All() []store.RoomCategory {
	t := current.Load()
	if t == nil {
		return nil
	}
	all := make([]store.RoomCategory, 0, len(t.byID))
	for _, c := range t.byID {
		all = append(all, c)
	}
	slices.SortFunc(all, func(a, b store.RoomCategory) int { return cmp.Compare(a.ID, b.ID) })
	return all
}

// Children returns the categories right under id, by id.
func Children(id int64) []store.RoomCategory {
	t := current.Load()
	if t == nil {
		return nil
	}
	return slices.Clone(t.children[id])
}

// Parents returns the categories above id, nearest first; a root has none.
func Parents(id int64) []store.RoomCategory {
	t := current.Load()
	if t == nil {
		return nil
	}
	var parents []store.RoomCategory
	c, ok := t.byID[id]
	// A category is never its own ancestor, so a chain longer than the tree is a loop in the data.
	for ok && c.ParentID.Valid && len(parents) < len(t.byID) {
		if c, ok = t.byID[c.ParentID.Int64]; ok {
			parents = append(parents, c)
		}
	}
	return parents
}
