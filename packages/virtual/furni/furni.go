// Package furni holds the furni definitions, which every player shares: loaded when the server starts, and kept
// (decisions server/0009 and server/0098).
package furni

import (
	"context"
	"database/sql"
	"fmt"
	"sync/atomic"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type definitions struct {
	byID map[int64]store.FurniDefinition
	// bySprite holds the first definition of each sprite, by id.
	bySprite map[string]store.FurniDefinition
}

// Load swaps in a whole new set, so a reader never sees half of one.
var current atomic.Pointer[definitions]

// Load reads every definition from db, in place of the ones in memory.
func Load(ctx context.Context, db *sql.DB) error {
	rows, err := store.New(db).ListFurniDefinitions(ctx)
	if err != nil {
		return fmt.Errorf("furni: %w", err)
	}
	d := &definitions{byID: make(map[int64]store.FurniDefinition, len(rows)), bySprite: make(map[string]store.FurniDefinition, len(rows))}
	for _, row := range rows {
		d.byID[row.ID] = row
		if _, known := d.bySprite[row.Sprite]; !known {
			d.bySprite[row.Sprite] = row
		}
	}
	current.Store(d)
	return nil
}

// Get returns the definition id.
func Get(id int64) (store.FurniDefinition, bool) {
	d := current.Load()
	if d == nil {
		return store.FurniDefinition{}, false
	}
	row, ok := d.byID[id]
	return row, ok
}

// BySprite returns the definition of a sprite, and of several that share it the one with the lowest id.
func BySprite(sprite string) (store.FurniDefinition, bool) {
	d := current.Load()
	if d == nil {
		return store.FurniDefinition{}, false
	}
	row, ok := d.bySprite[sprite]
	return row, ok
}
