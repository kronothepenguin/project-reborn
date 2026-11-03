// Package seed holds the rows the CMS needs in a new database. Only the installer
// writes them, when it installs, so a database made before a seed existed is
// made again.
package seed

import (
	"context"
	"fmt"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Holo's webstore listed its categories in fixed HTML, with these two under main
// categories of their own and every other one under Stickers.
const (
	BackgroundsCategory = 27
	NotesCategory       = 29
)

type category struct {
	id        int64
	name      string
	staffOnly bool
	position  int64
}

type item struct {
	id       int64
	category int64
	kind     string
	asset    string
	name     string
	price    int64
	quantity int64
}

// HomeStore writes Holo's home store: its categories, and its items with Holo's
// ids. q is the installer's transaction.
func HomeStore(ctx context.Context, q *store.Queries) error {
	for _, c := range categories {
		err := q.CreateHomeStoreCategory(ctx, store.CreateHomeStoreCategoryParams{
			ID:        c.id,
			Name:      c.name,
			StaffOnly: c.staffOnly,
			Position:  c.position,
		})
		if err != nil {
			return fmt.Errorf("seed: category %s: %w", c.name, err)
		}
	}
	for _, it := range items {
		err := q.SeedHomeStoreItem(ctx, store.SeedHomeStoreItemParams{
			ID:                  it.id,
			HomeStoreCategoryID: it.category,
			Kind:                it.kind,
			Asset:               it.asset,
			Name:                it.name,
			Price:               it.price,
			Quantity:            it.quantity,
		})
		if err != nil {
			return fmt.Errorf("seed: item %d: %w", it.id, err)
		}
	}
	return nil
}

// Art returns the paths, under the CMS's public files, of the stickers and
// backgrounds a store item can show.
func Art() []string {
	return slices.Clone(art)
}
