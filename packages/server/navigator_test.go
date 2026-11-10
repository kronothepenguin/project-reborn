package server

import (
	"path/filepath"
	"slices"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/category"
	"github.com/kronothepenguin/project-reborn/packages/virtual/model"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

func TestTheServerStartsWithTheNavigator(t *testing.T) {
	if c, ok := category.Get(3); !ok || c.Name != "Public Rooms" {
		t.Errorf("category 3 = %+v, %t; want Public Rooms", c, ok)
	}
	if _, ok := model.Get("newbie_lobby"); !ok {
		t.Error("the Welcome Lounge's model is not loaded")
	}
	if r, ok := room.Public(101); !ok || r.Name != "Welcome Lounge" {
		t.Errorf("public room 101 = %+v, %t; want the Welcome Lounge", r, ok)
	}
}

// While the update with the navigator's tables waits, nothing loads; once it is applied, the navigator does
// (decision 0064).
func TestTheNavigatorWaitsForTheUpdates(t *testing.T) {
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

	if loaded, err := loadNavigator(t.Context(), db, check); loaded || err != nil {
		t.Fatalf("loadNavigator() = %t, %v while the update waits; want false and no error", loaded, err)
	}
	if _, err := store.ApplyUpdates(t.Context(), db, updates[navigator:]); err != nil {
		t.Fatal(err)
	}
	if loaded, err := loadNavigator(t.Context(), db, check); !loaded || err != nil {
		t.Fatalf("loadNavigator() = %t, %v once the update is applied; want true", loaded, err)
	}
}
