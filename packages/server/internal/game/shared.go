package game

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"sync"
	"sync/atomic"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/catalogue"
	"github.com/kronothepenguin/project-reborn/packages/virtual/category"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
	"github.com/kronothepenguin/project-reborn/packages/virtual/model"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// shared remembers whether what every player shares is loaded, and whether it once waited for updates. mu keeps two
// loads apart.
var shared struct {
	mu     sync.Mutex
	loaded atomic.Bool
	waited bool
}

// LoadShared loads what every player shares the first time no update waits, and reports whether it is loaded: the
// navigator's categories, models and public rooms, and the furni definitions and the catalogue that reads them. They
// come with updates an administrator applies (decisions server/0064 and server/0098), so while updates wait it loads
// nothing, and the next call checks again. Once loaded, it returns at once. A load that comes after a wait is logged.
func LoadShared(ctx context.Context, db *sql.DB, updates *store.UpdateCheck) (bool, error) {
	if shared.loaded.Load() {
		return true, nil
	}
	shared.mu.Lock()
	defer shared.mu.Unlock()
	if shared.loaded.Load() {
		return true, nil
	}
	waiting, err := updates.Waiting(ctx)
	if err != nil {
		return false, fmt.Errorf("game: load shared: %w", err)
	}
	if waiting {
		shared.waited = true
		return false, nil
	}
	for _, load := range []func(context.Context, *sql.DB) error{category.Load, model.Load, room.Load, furni.Load, catalogue.Load} {
		if err := load(ctx, db); err != nil {
			return false, fmt.Errorf("game: load shared: %w", err)
		}
	}
	shared.loaded.Store(true)
	if shared.waited {
		slog.Info("server: the navigator and the catalogue are loaded")
	}
	return true, nil
}
