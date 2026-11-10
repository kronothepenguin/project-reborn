package category

import (
	"path/filepath"
	"slices"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func load(t *testing.T) {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "hotel.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	if err := Load(t.Context(), db); err != nil {
		t.Fatalf("Load: %v", err)
	}
}

func ids(categories []store.RoomCategory) []int64 {
	var got []int64
	for _, c := range categories {
		got = append(got, c.ID)
	}
	return got
}

func TestTheCategoriesLoadAsATree(t *testing.T) {
	load(t)
	if c, ok := Get(3); !ok || c.Name != "Public Rooms" || c.Kind != "public" {
		t.Errorf("Get(3) = %+v, %t; want Public Rooms", c, ok)
	}
	if _, ok := Get(1); ok {
		t.Error("Get(1) found a category Holo never had")
	}
	if got := ids(Children(3)); !slices.Equal(got, []int64{5, 7}) {
		t.Errorf("Children(3) = %v, want Outside spaces and Entertainment", got)
	}
	if got := ids(Children(4)); !slices.Equal(got, []int64{2, 6, 10, 24, 25, 26, 27, 28, 29}) {
		t.Errorf("Children(4) = %v, want Guestrooms' nine", got)
	}
	if got := ids(Parents(8)); !slices.Equal(got, []int64{5, 3}) {
		t.Errorf("Parents(8) = %v, want Outside spaces, then Public Rooms", got)
	}
	if got := Parents(3); len(got) != 0 {
		t.Errorf("Parents(3) = %v, want none for a root", got)
	}
}

func TestChildrenReturnsACopy(t *testing.T) {
	load(t)
	children := Children(3)
	children[0].Name = "changed"
	if Children(3)[0].Name == "changed" {
		t.Error("Children returns the tree's own slice")
	}
}

func TestAllListsEveryCategoryByID(t *testing.T) {
	load(t)
	got := ids(All())
	if len(got) != 15 || got[0] != 2 || got[len(got)-1] != 29 || !slices.IsSorted(got) {
		t.Errorf("All() = %v, want the 15 categories by id", got)
	}
}
