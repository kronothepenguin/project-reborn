---
type: Task
title: Build the home editor
description: GET /home/{name}/edit opens the editor island: drag, raise, skin and remove items, then save or cancel.
status: todo
phase: p3
depends_on: [p3-07]
packages: [packages/cms]
holo: [source/holo/user_profile.php, source/holo/web-gallery/static/js/homeview.js, source/holo/web-gallery/static/js/homeedit.js]
timestamp: 2026-11-03T17:26:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
---

# Goal

The owner decorates a home as in Holo's edit mode.

# Steps

- [ ] The toolbar: Inventory, Webstore, Cancel and Save.
- [ ] Dragging, with the dragged item on top.
- [ ] The edit menu with Holo's skins and Remove.
- [ ] Save posts the layout, and Cancel leaves without it.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
