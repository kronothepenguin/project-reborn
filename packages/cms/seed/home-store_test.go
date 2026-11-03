package seed

import (
	"database/sql"
	"os"
	"path/filepath"
	"slices"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

const public = "../public"

func TestEveryItemShowsArtThatExists(t *testing.T) {
	for _, it := range items {
		if _, err := os.Stat(filepath.Join(public, it.asset)); err != nil {
			t.Errorf("item %d (%s): %v", it.id, it.name, err)
		}
	}
}

func TestTheArtListMatchesThePublicFiles(t *testing.T) {
	var files []string
	for _, folder := range []string{"stickers", "backgrounds2"} {
		entries, err := os.ReadDir(filepath.Join(public, "c_images", folder))
		if err != nil {
			t.Fatal(err)
		}
		for _, entry := range entries {
			files = append(files, "c_images/"+folder+"/"+entry.Name())
		}
	}
	if !slices.Equal(Art(), files) {
		t.Errorf("Art() lists %d files and the folders hold %d: generate the list again", len(Art()), len(files))
	}
}

func TestTheSeedIsWhole(t *testing.T) {
	ids := make(map[int64]bool)
	known := make(map[int64]bool)
	for _, c := range categories {
		known[c.id] = true
	}
	for _, it := range items {
		switch {
		case ids[it.id]:
			t.Errorf("item %d twice", it.id)
		case !known[it.category]:
			t.Errorf("item %d in unknown category %d", it.id, it.category)
		case it.name == "" || it.price < 0 || it.quantity < 1:
			t.Errorf("item %d = %+v", it.id, it)
		case !slices.Contains([]string{"sticker", "background", "note"}, it.kind):
			t.Errorf("item %d has kind %q", it.id, it.kind)
		}
		ids[it.id] = true
	}
	for _, gone := range []int64{102, 231, 273, 274, 290} {
		if ids[gone] {
			t.Errorf("item %d has no art in Holo and should not be sold", gone)
		}
	}
}

func TestHomeStoreWritesTheStore(t *testing.T) {
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	q := store.New(db)
	if err := HomeStore(t.Context(), q); err != nil {
		t.Fatal(err)
	}

	categoryRows, err := q.ListHomeStoreCategories(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	if len(categoryRows) != 20 || categoryRows[0].Name != "General" || !categoryRows[1].StaffOnly || categoryRows[19].Name != "Notes" {
		t.Errorf("categories = %+v", categoryRows)
	}
	itemRows, err := q.ListHomeStoreItems(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	if len(itemRows) != 298 {
		t.Errorf("%d items, want 298", len(itemRows))
	}
	note, err := q.GetHomeStoreItem(t.Context(), 13)
	if err != nil {
		t.Fatal(err)
	}
	if note.Kind != "note" || note.Quantity != 5 || note.Price != 2 || !note.Enabled || note.HomeStoreCategoryID != 29 {
		t.Errorf("notes = %+v", note)
	}
	if _, err := q.GetHomeStoreItem(t.Context(), 102); err != sql.ErrNoRows {
		t.Errorf("item 102: %v, want none", err)
	}
}
