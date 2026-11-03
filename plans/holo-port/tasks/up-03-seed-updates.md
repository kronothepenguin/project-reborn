---
type: Task
title: Turn the seeds into updates
description: 0002-home-store.sql and 0003-ranks.sql replace the Go seeds, and the installer adds the administrator to the seeded group that holds every attribute.
status: done
phase: up
depends_on: [up-02]
packages: [packages/store, packages/cms, packages/installer, packages/housekeeping]
holo: [source/holo/install.php, source/holo/staff.php]
timestamp: 2026-11-03T22:08:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T22:08:29+00:00"}
---

# Goal

Holo's home store and Holo's ranks reach every database through updates
([0068](/decisions/0068-seeds-are-updates.md)).

# Steps

- [x] `0002-home-store.sql` writes Holo's 20 categories and 298 items with Holo's ids, through `INSERT OR IGNORE`,
  generated once from the data in `packages/cms/seed`.
- [x] `0003-ranks.sql` writes Holo's five ranks with their levels and attributes, only when the hotel has no access
  group.
- [x] `packages/cms/seed` keeps `Art()` and the category ids, and loses `HomeStore` and its item data.
- [x] The installer stops writing the ranks and the store. It adds the administrator to the seeded group that holds
  every attribute, with the administrator's habbo as display habbo.
- [x] Tests: a new database has the store and the ranks, a database whose store is filled keeps it unchanged, a hotel
  with access groups gets no ranks, and the installer's tests still pass.
- [x] Tests that make their own access groups or store items work beside the seeded ones.

# Verification

```sh
# gofmt, go vet and go test -race in packages/store, packages/cms, packages/installer and packages/housekeeping
cd packages/store && make check-docs
cd tests/e2e && pnpm test together habbos homes housekeeping-access housekeeping-admin housekeeping-store
```

Breaking these on purpose must fail a test: an item missing from `0002`, the ranks written over existing groups, and
the installer not joining the administrator to the group.

Results (2026-11-03T22:08:29+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store`, `packages/auth`, `packages/virtual`, `packages/cms`,
  `packages/housekeeping` and `packages/installer`; `make check-docs` passes and `go tool sqlc diff` finds nothing.
- `pnpm test together habbos homes housekeeping-access housekeeping-admin housekeeping-store` passes all 266 checks on
  the production binaries.
- The tests find Holo's 20 categories and 298 items, and the five ranks with their levels and attributes, on a new
  database; a store an administrator changed keeps its rows; a hotel with its own groups gets no ranks; the installer
  joins the administrator to the highest group holding `housekeeping.accessGroups` and refuses when none does.
- Breaking these on purpose fails a test: an item missing from `0002`, replacing rows that are there, writing the ranks
  or their attributes over existing groups, leaving the temporary table, the installer joining another group, picking the
  lowest group, or going on without one.

# Notes

- [p3-02](/tasks/p3-02-store-seed.md) wrote the store from the installer; this task replaces that path.
- The two updates were generated once from the Go data they replace, by throwaway tests, so their rows are the same.
- `0003-ranks.sql` decides in a temporary table, before writing anything, whether the hotel has no group: a second
  `NOT EXISTS` would see the first group it wrote.
- Times that SQL writes use `strftime('%Y-%m-%d %H:%M:%f+00:00', 'now')`, the format the store writes from Go.
- The queries `CreateHomeStoreCategory` and `SeedHomeStoreItem` served only the Go seed and are gone. Tests that made
  their own groups, store items or an empty store now use ids and names the seeds leave free, or empty the store first.
