// Package furni holds the furni definitions, which every player shares: loaded when the server starts, and kept
// (plans/server decisions 0009 and 0098).
package furni

import (
	"context"
	"database/sql"
	"fmt"
	"sync/atomic"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Load swaps in a whole new map, so a reader never sees half of one.
var current atomic.Pointer[map[int64]store.FurniDefinition]

// Load reads every definition from db, in place of the ones in memory.
func Load(ctx context.Context, db *sql.DB) error {
	rows, err := store.New(db).ListFurniDefinitions(ctx)
	if err != nil {
		return fmt.Errorf("furni: %w", err)
	}
	byID := make(map[int64]store.FurniDefinition, len(rows))
	for _, row := range rows {
		byID[row.ID] = row
	}
	current.Store(&byID)
	return nil
}

// Get returns the definition id.
func Get(id int64) (store.FurniDefinition, bool) {
	byID := current.Load()
	if byID == nil {
		return store.FurniDefinition{}, false
	}
	d, ok := (*byID)[id]
	return d, ok
}
