---
type: Task
title: Build the home editor
description: GET /home/{name}/edit opens the editor island: drag, raise, skin and remove items, then save or cancel.
status: done
phase: p3
depends_on: [p3-07]
packages: [packages/cms]
holo: [source/holo/user_profile.php, source/holo/web-gallery/static/js/homeview.js, source/holo/web-gallery/static/js/homeedit.js]
timestamp: 2026-11-03T18:37:58+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T18:37:58+00:00"}
---

# Goal

The owner decorates a home as in Holo's edit mode.

# Steps

- [x] The toolbar: Inventory, Webstore, Cancel and Save.
- [x] Dragging, with the dragged item on top.
- [x] The edit menu with Holo's skins and Remove.
- [x] Save posts the layout, and Cancel leaves without it.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-03T18:37:58+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`.
- The tests open the edit page for the owner of any of their habbos, send anyone else to the home, and offer club and staff
  skins only to club members and holders of `homes.staffItems`.
- In a real browser the owner drags a sticker 50 pixels and saves it there, sees an item dropped off the playground go back,
  changes the profile widget to Golden, finds no `Remove` for it, removes a sticker, and leaves with `Cancel`.

# Notes

- The page draws the playground and the island enhances its items, as `homeedit.js` did, so a home looks the same with and
  without JavaScript.
- `Cancel` first kept the address the island started with, because it was not reactive; the browser suite caught it.
