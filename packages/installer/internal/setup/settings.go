package setup

import (
	"context"
	"fmt"
	"maps"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// SaveSettings writes values, which settings.Validate accepted together, in one
// transaction and with no user, since none exists yet.
func (s *State) SaveSettings(ctx context.Context, values map[string]any) error {
	installation, ok := s.Current()
	if !ok {
		return ErrNotConfigured
	}
	tx, err := installation.DB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("setup: %w", err)
	}
	defer tx.Rollback()
	if err := setAll(ctx, store.New(tx), values); err != nil {
		return fmt.Errorf("setup: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("setup: %w", err)
	}
	return nil
}

// setAll writes the values one key at a time, as settings.Set does. A rule
// across two keys can refuse the first of them until the second is written, as
// the password limits do when both rise, so a refused key waits for the others.
// Validate passed, so a round that writes nothing is a real failure.
func setAll(ctx context.Context, q *store.Queries, values map[string]any) error {
	keys := slices.Sorted(maps.Keys(values))
	for len(keys) > 0 {
		var refused []string
		var last error
		for _, key := range keys {
			if err := settings.Set(ctx, q, 0, key, values[key]); err != nil {
				refused, last = append(refused, key), err
			}
		}
		if len(refused) == len(keys) {
			return last
		}
		keys = refused
	}
	return nil
}
