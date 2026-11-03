---
type: Task
title: Change a home
description: POST /homes/{id}/layout, /items, /items/{item}/skin and /items/{item}/delete place, move, skin and remove items for the home's owner.
status: done
phase: p3
depends_on: [p3-04, p3-06]
packages: [packages/cms, packages/store]
holo: [source/holo/savehome.php, source/holo/store.php, source/holo/edit_widget.php, source/holo/edit_stickie.php, source/holo/delete_sticker.php, source/holo/delete_stickie.php, source/holo/widget_delete.php]
timestamp: 2026-11-03T17:54:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:54:19+00:00"}
---

# Goal

Every change a home can take is checked and saved on the server.

# Steps

- [x] The owner of the home's habbo, from any of their habbos ([0065](/decisions/0065-owners-edit-all-their-homes.md)).
- [x] Placing a sticker or all of them, and a note with its text, from the inventory.
- [x] Skins, with club skins for club members and the staff skin for `homes.staffItems`.
- [x] A removed sticker returns to the inventory, and a removed note is gone.
- [x] The layout saves positions inside the playground and an owned background, with at most `homes.maxItems` items.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-03T17:54:19+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`, the tests of `packages/auth`, `packages/installer` and
  `packages/housekeeping` pass, and `make check-docs` passes in `packages/store`.
- The tests place one sticker and all of a kind, place a note with its text and skin, change skins, remove each kind,
  save positions and a background, and refuse other users, archived habbos, items not held and positions off the
  playground.
- Breaking these on purpose fails a test: the owner, the archived habbo, the limit, the inventory guard, club and staff
  skins, the note's length, a sticker going back, the profile widget's corner, the bounds, the background held and its
  kind, a sticker's skin and the store item's kind.

# Notes

- The answers are JSON for the editor. A placed note answers with its text; the editor's dialogs, in
  [p3-09](/tasks/p3-09-store-dialogs.md), show it as HTML.
- Each habbo's home starts with its profile widget, written with the habbo. Holo wrote it on the first view, and also let
  the owner remove it, after which it came back to its corner: here removing it sends it straight back there.
