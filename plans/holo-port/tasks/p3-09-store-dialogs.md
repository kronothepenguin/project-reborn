---
type: Task
title: Build the store and inventory dialogs
description: The editor's Webstore and Inventory dialogs browse, preview, buy and place items, and the note editor writes a note.
status: todo
phase: p3
depends_on: [p3-08]
packages: [packages/cms]
holo: [source/holo/store.php, source/holo/web-gallery/static/js/homeview.js, source/holo/web-gallery/styles/myhabbo/dialogs.css]
timestamp: 2026-11-03T17:26:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
---

# Goal

Buying and placing work from the editor, as in Holo's webstore.

# Steps

- [ ] The Webstore: main categories, subcategories, items, preview and the purchase confirmation.
- [ ] The Inventory: stickers, backgrounds, widgets and notes, with Place and Place all.
- [ ] The note editor with skins, the character counter and a preview.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
