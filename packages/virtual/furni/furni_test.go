package furni

import (
	"path/filepath"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestTheDefinitionsLoadByID(t *testing.T) {
	db, err := store.Open(filepath.Join(t.TempDir(), "hotel.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	if _, ok := Get(463); ok {
		t.Error("Get found a definition before any Load")
	}
	if err := Load(t.Context(), db); err != nil {
		t.Fatalf("Load: %v", err)
	}

	if chair, ok := Get(463); !ok || chair.Sprite != "rclr_chair" || chair.Kind != "seat" || chair.Height != 1 {
		t.Errorf("Get(463) = %+v, %t; want the recycler's Palm Chair, a seat", chair, ok)
	}
	if mummy, ok := Get(105); !ok || mummy.Sprite != "poster" || mummy.Data != "44" || mummy.Kind != "wall" {
		t.Errorf("Get(105) = %+v, %t; want the Mummy poster, a wall item", mummy, ok)
	}
	if _, ok := Get(661); ok {
		t.Error("Get(661) found a definition for the second row of the Mummy poster")
	}
	if box, ok := BySprite("present_gen3"); !ok || box.ID != 1374 || box.Tradeable {
		t.Errorf("BySprite(present_gen3) = %+v, %t; want the third present box", box, ok)
	}
	if bed, ok := BySprite("bed_budgetb"); !ok || bed.ID != 444 {
		t.Errorf("BySprite(bed_budgetb) = %+v, %t; want the first of its five colours, 444", bed, ok)
	}
	if _, ok := BySprite("no_such_furni"); ok {
		t.Error("BySprite found a sprite the catalogue does not have")
	}
}
