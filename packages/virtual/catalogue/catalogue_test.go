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

func TestTheCatalogueLoadsItsPagesInOrder(t *testing.T) {
	load(t)
	pages := Pages()
	if len(pages) != 67 || pages[0].Code != "Purse" || pages[1].Code != "Frontpage" {
		t.Fatalf("%d pages, the first %q; want Holo's 67, the Purse first", len(pages), pages[0].Code)
	}
	if !slices.IsSortedFunc(pages, func(a, b Page) int { return int(a.Position - b.Position) }) {
		t.Error("the pages are not in the order of their positions")
	}
	if recycler, ok := Get("Recycler"); !ok || recycler.Name != "Ecotron" || len(recycler.Items) != 0 {
		t.Errorf("Get(Recycler) = %+v, %t; want the Ecotron, which sells nothing", recycler, ok)
	}
	if _, ok := Get("Pets"); ok {
		t.Error("Get(Pets) found a page that waits for S7")
	}

	spaces, _ := Get("Spaces")
	var numbers []int64
	for _, text := range spaces.Texts {
		numbers = append(numbers, text.Number)
	}
	if !slices.Equal(numbers, []int64{1, 2, 3, 4, 5, 6, 7}) || spaces.Texts[0].Text != "Wall" {
		t.Errorf("the Spaces page's texts = %+v, want its seven by number", spaces.Texts)
	}
	if len(spaces.Items) != 40 || !slices.IsSortedFunc(spaces.Items, func(a, b Item) int { return int(a.Position - b.Position) }) {
		t.Errorf("the Spaces page sells %d items, want 40 in the order of their positions", len(spaces.Items))
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

func TestPagesReturnsACopyOfItsList(t *testing.T) {
	load(t)
	pages := Pages()
	pages[0].Name = "changed"
	if Pages()[0].Name == "changed" {
		t.Error("Pages returns the list in memory")
	}
}
