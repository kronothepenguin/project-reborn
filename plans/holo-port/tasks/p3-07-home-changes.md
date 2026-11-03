---
type: Task
title: Change a home
description: POST /homes/{id}/layout, /items, /items/{item}/skin and /items/{item}/delete place, move, skin and remove items for the home's owner.
status: todo
phase: p3
depends_on: [p3-04, p3-06]
packages: [packages/cms, packages/store]
holo: [source/holo/savehome.php, source/holo/store.php, source/holo/edit_widget.php, source/holo/edit_stickie.php, source/holo/delete_sticker.php, source/holo/delete_stickie.php, source/holo/widget_delete.php]
timestamp: 2026-11-03T17:26:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
---

# Goal

Every change a home can take is checked and saved on the server.

# Steps

- [ ] The owner of the home's habbo, from any of their habbos ([0065](/decisions/0065-owners-edit-all-their-homes.md)).
- [ ] Placing a sticker or all of them, and a note with its text, from the inventory.
- [ ] Skins, with club skins for club members and the staff skin for `homes.staffItems`.
- [ ] A removed sticker returns to the inventory, and a removed note is gone.
- [ ] The layout saves positions inside the playground and an owned background, with at most `homes.maxItems` items.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
