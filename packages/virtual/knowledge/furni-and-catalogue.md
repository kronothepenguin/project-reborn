---
type: Go Package
title: furni and catalogue
description: What each furni is and what the catalogue sells, loaded when the server starts and kept, and the code that creates the pieces one furni gives.
resource: packages/virtual/furni
---

# What it holds

What each furni is and what the catalogue sells, loaded when the server starts and kept (decision server/0098):
`server.New` calls `furni.Load(ctx, db)` and then `catalogue.Load(ctx, db)`, with the navigator's shared data. A load
swaps in a whole new copy, so a reader never sees half of one, and the getters take no lock.

# Examples

```go
chair, ok := furni.Get(463)           // the recycler's Palm Chair
page, ok := catalogue.Get("Recycler") // by the page's code, the client's id for it
for _, p := range catalogue.Pages() {
	for _, item := range p.Items {
		for _, f := range item.Furni {
			_ = f.Sprite // and f.Amount, how many pieces the item gives
		}
	}
}
```

# Functions

- `furni`: `Get(id)`, a furni definition, and `BySprite(sprite)`, the definition of a sprite, the one with the lowest
  id of several that share it.
- `catalogue`: `Pages()`, every page in the catalogue's order, and `Get(code)`. A `Page` carries its numbered `Texts`
  and its `Items`, each with the `Furni` it gives, a definition and an amount. `Item.Deal()` tells a deal, an item that
  gives more than one piece.
- `furni.Create(ctx, q, sprite, piece)` creates what a habbo gets for one furni, as a purchase, an item voucher or any
  other gift gives it (decision server/0125): the piece, a pad of post-its with its 20 notes, or a teleport with the
  other of its pair. It writes through `q`, in the caller's transaction, and reads nothing from memory, so the site
  calls it too. `IsTeleport`, `IsPostIt` and `IsDecoration` tell those furni by their sprite.
- `catalogue.Load` takes each furni from `virtual/furni`, so `furni.Load` runs first.
- `Pages` returns a copy of its list. The texts, items and furni of a page are the ones in memory, to read and never to
  change.
