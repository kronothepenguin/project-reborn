package r26

import (
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/catalogue"
)

func TestAProductLineByKindOfItem(t *testing.T) {
	poster := store.FurniDefinition{Sprite: "poster", Kind: "wall", Data: "44"}
	for name, c := range map[string]struct {
		item catalogue.Item
		want string
	}{
		"control characters": {
			catalogue.Item{CatalogueItem: store.CatalogueItem{Code: "7", Name: "Two\tparts", Description: "Line\rbreak", Price: 1}, Furni: []catalogue.Furni{{FurniDefinition: poster, Amount: 1}}},
			"Two parts\tLine break\t1\t\ti\tposter 44\t\t\t7\t",
		},
	} {
		if got := product(c.item); got != c.want {
			t.Errorf("%s: product() = %q, want %q", name, got, c.want)
		}
	}
}
