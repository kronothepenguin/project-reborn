package r26

import (
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/catalogue"
)

func TestAProductLineByKindOfItem(t *testing.T) {
	chair := store.FurniDefinition{Sprite: "chair_plasto*4", Kind: "seat", Length: 1, Width: 2, Colours: "#ffffff,#00cc00"}
	poster := store.FurniDefinition{Sprite: "poster", Kind: "wall", Data: "44"}
	for name, c := range map[string]struct {
		item catalogue.Item
		want string
	}{
		"a floor furni": {
			catalogue.Item{CatalogueItem: store.CatalogueItem{Code: "431", Name: "Pod Chair", Description: "Hip", Price: 3}, Furni: []catalogue.Furni{{FurniDefinition: chair, Amount: 1}}},
			"Pod Chair\tHip\t3\t\ts\tchair_plasto*4\t0\t1,2\t431\t#ffffff,#00cc00",
		},
		"a wall item": {
			catalogue.Item{CatalogueItem: store.CatalogueItem{Code: "105", Name: "Mummy", Price: 3}, Furni: []catalogue.Furni{{FurniDefinition: poster, Amount: 1}}},
			"Mummy\t\t3\t\ti\tposter 44\t\t\t105\t",
		},
		"a deal": {
			catalogue.Item{CatalogueItem: store.CatalogueItem{Code: "deal1", Name: "Starter", Price: 9}, Furni: []catalogue.Furni{{FurniDefinition: chair, Amount: 2}, {FurniDefinition: poster, Amount: 1}}},
			"Starter\t\t9\t\td\t\t\t\tdeal1\t\t2\tchair_plasto*4\t2\t#ffffff,#00cc00\tposter 44\t1\t",
		},
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
