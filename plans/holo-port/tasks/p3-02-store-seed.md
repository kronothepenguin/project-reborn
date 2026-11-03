---
type: Task
title: Seed the home store
description: The CMS owns Holo's home store categories and items, the installer writes them, and the store queries and Holo's home images are in place.
status: done
phase: p3
depends_on: [p3-01]
packages: [packages/cms, packages/installer, packages/store]
holo: [source/holo/install.php, source/holo/store.php, source/holo/web-gallery/styles/myhabbo/assets.css]
timestamp: 2026-11-03T17:38:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:38:46+00:00"}
---

# Goal

A new hotel opens with Holo's home store, without the art that does not exist.

# Steps

- [x] `packages/cms/seed` holds Holo's categories and items, mapped to the art through `assets.css`, and the list of the art.
- [x] Items whose art is missing or whose name is broken are left out.
- [x] The installer writes the seed in its transaction, and only the installer ([0066](/decisions/0066-seeds-reach-a-database-through-the-installer.md)).
- [x] The store queries for categories, items and the inventory.
- [x] Holo's home images, widget previews and smilies join the CMS's public files.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-03T17:38:46+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`, `packages/installer` and `packages/store`, and
  `make check-docs` passes.
- The seed has Holo's 20 categories and 298 of its 302 items, with Holo's ids; a test checks that every item's art exists
  and that the art list matches the public files.
- The installer writes the seed in the administrator's transaction, and `pnpm test habbos housekeeping-access` passes all
  140 checks on a hotel installed that way.
- Breaking these on purpose fails a test: skipping the items, and the installer not writing the seed.

# Notes

- Holo's install says 303 records and writes 302: there is no id 290.
- The six smilies came with [p3-03](/tasks/p3-03-bbcode.md), which needs them.
- The seed lives in `packages/cms/seed`, a package of its own, so that the installer can import it without the CMS's
  embedded files.
