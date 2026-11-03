---
type: Task
title: Add the database attribute
description: housekeeping.database joins the catalogue, 0004-database-attribute.sql grants it to the holders of housekeeping.accessGroups, and a test keeps every attribute with them on a new database.
status: done
phase: up
depends_on: [up-03]
packages: [packages/auth, packages/store]
holo: []
timestamp: 2026-11-03T22:16:36+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T22:16:36+00:00"}
---

# Goal

Applying updates has its own attribute, which administrators hold on new and existing hotels
([0070](/decisions/0070-housekeeping-applies-updates.md)).

# Steps

- [x] `housekeeping.database` joins the catalogue of `packages/auth` as "applying database updates and config.json
  changes".
- [x] `0004-database-attribute.sql` grants it to every group, and every user, that holds `housekeeping.accessGroups`.
- [x] A test: on a new database, the holders of `housekeeping.accessGroups` hold every attribute of the catalogue.
- [x] The access group entity in the store's knowledge lists the attribute.

# Verification

```sh
# gofmt, go vet and go test -race in packages/auth, packages/store and packages/housekeeping
cd packages/store && make check-docs
```

Breaking these on purpose must fail a test: an attribute added to the catalogue without its update, and `0004` granting
the attribute to a group without `housekeeping.accessGroups`.
- `TestCatalogue` and the `housekeeping-admin` browser suite count the attributes on purpose, so both now name 20.
