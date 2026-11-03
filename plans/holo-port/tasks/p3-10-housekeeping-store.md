---
type: Task
title: Manage the home store in housekeeping
description: /housekeeping/home-store lists the store, adds an item from the art in the repository, and edits or disables one.
status: done
phase: p3
depends_on: [p3-02]
packages: [packages/housekeeping, packages/store]
holo: [source/holo/housekeeping/add_homes_stuff.php]
timestamp: 2026-11-03T18:13:40+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T18:13:40+00:00"}
---

# Goal

Staff with housekeeping.homeStore keep the store without fetching URLs or writing CSS.

# Steps

- [x] List the items in a gold list, by category.
- [x] Add an item from the art in the repository, with Holo's fields.
- [x] Edit an item's name, price, category and whether it is sold.
- [x] Every change writes a staff log row.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-03T18:13:40+00:00):

- Built on the branch `p3-hk-store` and merged into `main` as `e1de0234`.
- On the merged result: `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`, and
  `pnpm test housekeeping-store housekeeping-access housekeeping-settings housekeeping-admin` passes all 218 checks in a
  real browser.
- Breaking these on purpose fails a test: the attribute on each route, the art checked against the repository's list,
  both log rows, and the cap on quantity.

# Notes

- After the merge the quantity got the same cap as the price, because every purchase adds it to an inventory.
- The page reads the whole store and pages it in Go, since the store holds about 300 items.
- A `homeStore.update` row names the item as well as the fields saved, because `staff_logs` has no column for an item.
