---
type: Task
title: Seed the home store
description: The CMS owns Holo's home store categories and items, the installer writes them, and the store queries and Holo's home images are in place.
status: todo
phase: p3
depends_on: [p3-01]
packages: [packages/cms, packages/installer, packages/store]
holo: [source/holo/install.php, source/holo/store.php, source/holo/web-gallery/styles/myhabbo/assets.css]
timestamp: 2026-11-03T17:26:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
---

# Goal

A new hotel opens with Holo's home store, without the art that does not exist.

# Steps

- [ ] `packages/cms/seed` holds Holo's categories and items, mapped to the art through `assets.css`, and the list of the art.
- [ ] Items whose art is missing or whose name is broken are left out.
- [ ] The installer writes the seed in its transaction, and only the installer ([0066](/decisions/0066-seeds-reach-a-database-through-the-installer.md)).
- [ ] The store queries for categories, items and the inventory.
- [ ] Holo's home images, widget previews and smilies join the CMS's public files.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
