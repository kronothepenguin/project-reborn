---
type: Task
title: Sell home items
description: The store and the inventory answer as JSON, and a purchase takes credits, writes the ledger and fills the inventory in one transaction.
status: done
phase: p3
depends_on: [p3-02]
packages: [packages/cms, packages/store]
holo: [source/holo/store.php]
timestamp: 2026-11-03T17:45:56+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:45:56+00:00"}
---

# Goal

Habbos buy stickers, backgrounds and notes as in Holo's webstore.

# Steps

- [x] `GET /home-store`, `GET /home-store/categories/{id}`, `GET /me/inventory`.
- [x] `POST /home-store/items/{id}/purchase`, guarded at zero, with a `store` ledger row.
- [x] A background is bought once ([0064](/decisions/0064-backgrounds-are-unlocks.md)).
- [x] The staff category takes `homes.staffItems`, and disabled items are not sold.
- [x] Holo's texts for every answer.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-03T17:45:56+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`, and `make check-docs` passes in `packages/store`.
- The tests buy stickers, a note pack of five and a background, with the ledger row, the credits and the inventory checked,
  and every refusal leaves all three as they were.
- Breaking these on purpose fails a test: the guard on credits, the background bought once, the staff category, items not
  sold, the ledger row, the pack's quantity, and the query's filter on items not sold.

# Notes

- Holo's webstore fixed its main categories in HTML: Backgrounds and Notes held one category each, and Stickers every other
  one, the staff category of backgrounds too. `seed.BackgroundsCategory` and `seed.NotesCategory` keep that.
- The answers are JSON for the editor's dialogs, built in [p3-09](/tasks/p3-09-store-dialogs.md), which show Holo's texts.
