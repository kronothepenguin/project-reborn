// Package model holds the room models, which every player shares: loaded when the server starts, and kept
// (decisions server/0009 and server/0060).
package model

import (
	"context"
	"database/sql"
	"fmt"
	"sync/atomic"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type models struct {
	byID   map[int64]store.RoomModel
	byName map[string]store.RoomModel
}

var current atomic.Pointer[models]

// Load reads every model from db, in place of the ones in memory.
func Load(ctx context.Context, db *sql.DB) error {
	rows, err := store.New(db).ListRoomModels(ctx)
	if err != nil {
		return fmt.Errorf("model: %w", err)
	}
	m := &models{byID: make(map[int64]store.RoomModel, len(rows)), byName: make(map[string]store.RoomModel, len(rows))}
	for _, row := range rows {
		m.byID[row.ID] = row
		m.byName[row.Name] = row
	}
	current.Store(m)
	return nil
}

// Get returns the model the client names, such as a or newbie_lobby.
func Get(name string) (store.RoomModel, bool) {
	m := current.Load()
	if m == nil {
		return store.RoomModel{}, false
	}
	row, ok := m.byName[name]
	return row, ok
}

// ByID returns the model id.
func ByID(id int64) (store.RoomModel, bool) {
	m := current.Load()
	if m == nil {
		return store.RoomModel{}, false
	}
	row, ok := m.byID[id]
	return row, ok
}
