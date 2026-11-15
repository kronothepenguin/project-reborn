package catalogue

import (
	"path/filepath"
	"slices"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
)

func load(t *testing.T) {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "hotel.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	if err := furni.Load(t.Context(), db); err != nil {
		t.Fatalf("furni.Load: %v", err)
	}
	if err := Load(t.Context(), db); err != nil {
		t.Fatalf("Load: %v", err)
	}
}

func TestAnItemComesWithItsFurni(t *testing.T) {
	load(t)
	pets, _ := Get("Pet Accesories")
	i := slices.IndexFunc(pets.Items, func(item Item) bool { return item.Name == "Doggy Bones" })
	if i < 0 {
		t.Fatal("the Pet Accesories page does not sell Doggy Bones")
	}
	bones := pets.Items[i]
	if bones.Price != 2 || len(bones.Furni) != 1 || bones.Furni[0].Amount != 6 || bones.Furni[0].Sprite != "petfood1" || !bones.Deal() {
		t.Errorf("Doggy Bones = %+v, want a deal of 6 pieces of petfood1 for 2 credits", bones)
	}
	deals := 0
	for _, page := range Pages() {
		for _, item := range page.Items {
			if len(item.Furni) == 0 {
				t.Errorf("item %d %s of page %s gives no furni", item.ID, item.Name, page.Code)
			}
			if item.Deal() {
				deals++
			}
		}
	}
	if deals != 4 {
		t.Errorf("%d deals in the catalogue, want Holo's four pet food packs", deals)
	}
}
