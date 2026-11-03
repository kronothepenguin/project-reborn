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

func newStore(t *testing.T) *store.Queries {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	return store.New(db)
}

func TestEveryItemShowsArtThatExists(t *testing.T) {
	items, err := newStore(t).ListHomeStoreItems(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	for _, it := range items {
		if _, err := os.Stat(filepath.Join(public, it.Asset)); err != nil {
			t.Errorf("item %d (%s): %v", it.ID, it.Name, err)
		}
		if !slices.Contains(Art(), it.Asset) && it.Kind != "note" {
			t.Errorf("item %d (%s) shows %s, which the art list lacks", it.ID, it.Name, it.Asset)
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

func TestANewDatabaseHasHolosStore(t *testing.T) {
	q := newStore(t)
	categories, err := q.ListHomeStoreCategories(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	if len(categories) != 20 || categories[0].Name != "General" || !categories[1].StaffOnly || categories[19].Name != "Notes" {
		t.Errorf("categories = %+v", categories)
	}
	for id, name := range map[int64]string{BackgroundsCategory: "Backgrounds", NotesCategory: "Notes"} {
		if c, err := q.GetHomeStoreCategory(t.Context(), id); err != nil || c.Name != name {
			t.Errorf("category %d = %+v, %v, want %s", id, c, err, name)
		}
	}

	items, err := q.ListHomeStoreItems(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 298 {
		t.Errorf("%d items, want 298", len(items))
	}
	for _, it := range items {
		if it.Name == "" || it.Price < 0 || it.Quantity < 1 || !it.Enabled || !slices.Contains([]string{"sticker", "background", "note"}, it.Kind) {
			t.Errorf("item %d = %+v", it.ID, it)
		}
	}
	note, err := q.GetHomeStoreItem(t.Context(), 13)
	if err != nil {
		t.Fatal(err)
	}
	if note.Kind != "note" || note.Quantity != 5 || note.Price != 2 || note.HomeStoreCategoryID != NotesCategory {
		t.Errorf("notes = %+v", note)
	}
	for _, gone := range []int64{102, 231, 273, 274, 290} {
		if _, err := q.GetHomeStoreItem(t.Context(), gone); err != sql.ErrNoRows {
			t.Errorf("item %d: %v, want none: Holo had no art for it", gone, err)
		}
	}
}
