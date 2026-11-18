package game

import (
	"path/filepath"
	"slices"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/category"
)

// While the update with the navigator's tables waits, nothing loads; the first call once every update is applied
// loads the navigator and the catalogue, and later calls read the database no more (decisions reborn/0006,
// server/0064 and server/0098).
func TestWhatEveryPlayerSharesLoadsOnceNoUpdateWaits(t *testing.T) {
	db, err := store.Connect(filepath.Join(t.TempDir(), "waiting.db"))
	if err != nil {
		t.Fatalf("store.Connect: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	updates, err := store.Updates()
	if err != nil {
		t.Fatal(err)
	}
	navigator := slices.IndexFunc(updates, func(u store.Update) bool { return u.Version == 10 && u.Name == "navigator" })
	if navigator < 0 {
		t.Fatal("no update 0010-navigator.sql")
	}
	if _, err := store.ApplyUpdates(t.Context(), db, updates[:navigator]); err != nil {
		t.Fatal(err)
	}
	check := store.NewUpdateCheck(db, updates)

	if loaded, err := LoadShared(t.Context(), db, check); loaded || err != nil {
		t.Fatalf("LoadShared() = %t, %v while the update waits; want false and no error", loaded, err)
	}
	if len(category.All()) != 0 {
		t.Fatal("the navigator's categories loaded while the update waited")
	}
	if _, err := store.ApplyUpdates(t.Context(), db, updates[navigator:]); err != nil {
		t.Fatal(err)
	}
	if loaded, err := LoadShared(t.Context(), db, check); !loaded || err != nil {
		t.Fatalf("LoadShared() = %t, %v once the updates are applied; want true", loaded, err)
	}
	if len(category.All()) == 0 {
		t.Error("the navigator's categories did not load once the updates were applied")
	}
	db.Close()
	if loaded, err := LoadShared(t.Context(), db, check); !loaded || err != nil {
		t.Errorf("LoadShared() = %t, %v once loaded, on a closed database; want true, read from memory", loaded, err)
	}
}
