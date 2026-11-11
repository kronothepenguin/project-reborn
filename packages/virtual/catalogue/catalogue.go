// Package catalogue holds the catalogue's pages and what they sell, which every player shares: loaded when the server
// starts, after the furni definitions it reads, and kept (plans/server decisions 0009 and 0098).
package catalogue

import (
	"context"
	"database/sql"
	"fmt"
	"slices"
	"sync/atomic"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
)

// Page is a page of the catalogue with its numbered texts, by number, and what it sells, in the page's order.
type Page struct {
	store.CataloguePage
	Texts []store.CataloguePageText
	Items []Item
}

// Item is what a page sells, with the furni it gives.
type Item struct {
	store.CatalogueItem
	Furni []Furni
}

// Deal reports whether the item gives more than one piece of furni.
func (i Item) Deal() bool {
	var pieces int64
	for _, f := range i.Furni {
		pieces += f.Amount
	}
	return pieces > 1
}

// Furni is a furni that an item gives, and how many pieces of it.
type Furni struct {
	store.FurniDefinition
	Amount int64
}

type pages struct {
	inOrder []Page
	byCode  map[string]Page
}

// Load swaps in a whole new catalogue, so a reader never sees half of one.
var current atomic.Pointer[pages]

// Load reads the catalogue from db, in place of the one in memory. It takes each item's furni from virtual/furni,
// which is loaded before it.
func Load(ctx context.Context, db *sql.DB) error {
	q := store.New(db)
	rows, err := q.ListCataloguePages(ctx)
	if err != nil {
		return fmt.Errorf("catalogue: %w", err)
	}
	texts, err := q.ListCataloguePageTexts(ctx)
	if err != nil {
		return fmt.Errorf("catalogue: %w", err)
	}
	items, err := q.ListCatalogueItems(ctx)
	if err != nil {
		return fmt.Errorf("catalogue: %w", err)
	}
	given, err := q.ListCatalogueItemFurni(ctx)
	if err != nil {
		return fmt.Errorf("catalogue: %w", err)
	}

	furniOf := make(map[int64][]Furni, len(items))
	for _, g := range given {
		d, ok := furni.Get(g.FurniDefinitionID)
		if !ok {
			return fmt.Errorf("catalogue: item %d gives the furni %d, which virtual/furni does not hold", g.CatalogueItemID, g.FurniDefinitionID)
		}
		furniOf[g.CatalogueItemID] = append(furniOf[g.CatalogueItemID], Furni{FurniDefinition: d, Amount: g.Amount})
	}
	itemsOf := make(map[int64][]Item, len(rows))
	for _, i := range items {
		itemsOf[i.CataloguePageID] = append(itemsOf[i.CataloguePageID], Item{CatalogueItem: i, Furni: furniOf[i.ID]})
	}
	textsOf := make(map[int64][]store.CataloguePageText, len(rows))
	for _, t := range texts {
		textsOf[t.CataloguePageID] = append(textsOf[t.CataloguePageID], t)
	}
	p := &pages{inOrder: make([]Page, 0, len(rows)), byCode: make(map[string]Page, len(rows))}
	for _, row := range rows {
		page := Page{CataloguePage: row, Texts: textsOf[row.ID], Items: itemsOf[row.ID]}
		p.inOrder = append(p.inOrder, page)
		p.byCode[row.Code] = page
	}
	current.Store(p)
	return nil
}

// Pages returns every page, in the catalogue's order. The pages' texts, items and furni are the ones in memory, to
// read and never to change.
func Pages() []Page {
	p := current.Load()
	if p == nil {
		return nil
	}
	return slices.Clone(p.inOrder)
}

// Get returns the page the client names by code, such as Recycler. Its texts, items and furni are the ones in memory,
// to read and never to change.
func Get(code string) (Page, bool) {
	p := current.Load()
	if p == nil {
		return Page{}, false
	}
	page, ok := p.byCode[code]
	return page, ok
}
