package model

import (
	"path/filepath"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestTheModelsLoadByNameAndID(t *testing.T) {
	db, err := store.Open(filepath.Join(t.TempDir(), "hotel.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	if err := Load(t.Context(), db); err != nil {
		t.Fatalf("Load: %v", err)
	}

	a, ok := Get("a")
	if !ok || !a.HabboRooms || a.ClubOnly || a.DoorX != 3 || a.DoorY != 5 {
		t.Errorf("Get(a) = %+v, %t; want a habbo room model with its door at 3, 5", a, ok)
	}
	if g, _ := Get("g"); !g.ClubOnly {
		t.Error("model g is not a club model")
	}
	if lobby, ok := ByID(19); !ok || lobby.Name != "newbie_lobby" || lobby.HabboRooms {
		t.Errorf("ByID(19) = %+v, %t; want the Welcome Lounge's model", lobby, ok)
	}
	if _, ok := Get("model_a"); ok {
		t.Error("Get found a model by the name the client sends with its prefix")
	}
}
