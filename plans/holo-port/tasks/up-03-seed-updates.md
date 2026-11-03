---
type: Task
title: Turn the seeds into updates
description: 0002-home-store.sql and 0003-ranks.sql replace the Go seeds, and the installer adds the administrator to the seeded group that holds every attribute.
status: todo
phase: up
depends_on: [up-02]
packages: [packages/store, packages/cms, packages/installer, packages/housekeeping]
holo: [source/holo/install.php, source/holo/staff.php]
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
---

# Goal

Holo's home store and Holo's ranks reach every database through updates
([0068](/decisions/0068-seeds-are-updates.md)).

# Steps

- [ ] `0002-home-store.sql` writes Holo's 20 categories and 298 items with Holo's ids, through `INSERT OR IGNORE`,
  generated once from the data in `packages/cms/seed`.
- [ ] `0003-ranks.sql` writes Holo's five ranks with their levels and attributes, only when the hotel has no access
  group.
- [ ] `packages/cms/seed` keeps `Art()` and the category ids, and loses `HomeStore` and its item data.
- [ ] The installer stops writing the ranks and the store. It adds the administrator to the seeded group that holds
  every attribute, with the administrator's habbo as display habbo.
- [ ] Tests: a new database has the store and the ranks, a database whose store is filled keeps it unchanged, a hotel
  with access groups gets no ranks, and the installer's tests still pass.
- [ ] Tests that make their own access groups or store items work beside the seeded ones.

# Verification

```sh
# gofmt, go vet and go test -race in packages/store, packages/cms, packages/installer and packages/housekeeping
cd packages/store && make check-docs
cd tests/e2e && pnpm test together habbos homes housekeeping-access housekeeping-admin housekeeping-store
```

Breaking these on purpose must fail a test: an item missing from `0002`, the ranks written over existing groups, and
the installer not joining the administrator to the group.

# Notes

- [p3-02](/tasks/p3-02-store-seed.md) wrote the store from the installer; this task replaces that path.
