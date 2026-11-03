---
type: Task
title: Manage the home store in housekeeping
description: /housekeeping/home-store lists the store, adds an item from the art in the repository, and edits or disables one.
status: todo
phase: p3
depends_on: [p3-02]
packages: [packages/housekeeping, packages/store]
holo: [source/holo/housekeeping/add_homes_stuff.php]
timestamp: 2026-11-03T17:26:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
---

# Goal

Staff with housekeeping.homeStore keep the store without fetching URLs or writing CSS.

# Steps

- [ ] List the items in a gold list, by category.
- [ ] Add an item from the art in the repository, with Holo's fields.
- [ ] Edit an item's name, price, category and whether it is sold.
- [ ] Every change writes a staff log row.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
