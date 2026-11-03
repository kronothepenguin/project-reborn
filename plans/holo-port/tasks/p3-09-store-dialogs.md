---
type: Task
title: Build the store and inventory dialogs
description: The editor's Webstore and Inventory dialogs browse, preview, buy and place items, and the note editor writes a note.
status: done
phase: p3
depends_on: [p3-08]
packages: [packages/cms]
holo: [source/holo/store.php, source/holo/web-gallery/static/js/homeview.js, source/holo/web-gallery/styles/myhabbo/dialogs.css]
timestamp: 2026-11-03T18:37:58+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T18:37:58+00:00"}
---

# Goal

Buying and placing work from the editor, as in Holo's webstore.

# Steps

- [x] The Webstore: main categories, subcategories, items, preview and the purchase confirmation.
- [x] The Inventory: stickers, backgrounds, widgets and notes, with Place and Place all.
- [x] The note editor with skins, the character counter and a preview.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-03T18:37:58+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`, and `pnpm test homes` passes all 25 checks in a real browser.
- In the browser the owner buys a sticker after Holo's question, a pack of notes and a background in the Webstore, places
  the sticker from the Inventory, writes a note in the note editor and sees it as it will show, chooses the background,
  and finds the note and the background on the home after saving.
- The tests answer a placed note with its HTML, and `POST /bbcode/preview` refuses guests and lets no HTML through.

# Notes

- The note's preview uses `POST /bbcode/preview`, the plan's route for the forum's preview, built here first.
- The note editor offers the six skins of Holo's note editor; the edit menu offers the club and staff skins to those who
  may use them.
