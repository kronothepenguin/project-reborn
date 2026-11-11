---
type: Task
title: Load the furni definitions and the catalogue in virtual
description: virtual/furni holds the furni definitions and virtual/catalogue the pages and what they sell, both loaded when the server starts.
status: done
phase: s5
depends_on: [s5-01]
packages: [packages/virtual, packages/server]
client: []
timestamp: 2026-11-11T16:07:41+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T16:07:41+00:00"}
---

# Goal

The server reads furni and the catalogue from memory, as shared data
([0098](/decisions/0098-virtual-furni-and-catalogue.md), [0009](/decisions/0009-virtual-holds-the-server-state.md)).

# Steps

- [x] `packages/virtual/furni` holds the definitions, read by id; `packages/virtual/catalogue` holds the pages in their
  order, each with its items, and reads `virtual/furni` ([0098](/decisions/0098-virtual-furni-and-catalogue.md)).
- [x] Neither keeps a database connection: their loaders receive the `*sql.DB`
  ([0009](/decisions/0009-virtual-holds-the-server-state.md)).
- [x] `server.New` loads both with the navigator, once no database update waits
  ([0064](/decisions/0064-the-navigator-loads-once-the-updates-are-applied.md)).
- [x] Tests, and the two packages in `packages/virtual`'s README.

# Verification

```sh
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

Results:

- `packages/virtual/furni` holds the furni definitions by id, with `Load` and `Get`. `packages/virtual/catalogue` holds
  the pages in the catalogue's order and by their code, with `Load`, `Pages` and `Get`: a `Page` carries its numbered
  texts and its items, each with the furni it gives, taken from `virtual/furni`, and `Item.Deal` tells a deal, an item
  that gives more than one piece ([0098](/decisions/0098-virtual-furni-and-catalogue.md)).
- Neither keeps a database connection, and a load swaps in a whole new copy, so a reader never sees half of one
  ([0009](/decisions/0009-virtual-holds-the-server-state.md)).
- `server.New` loads both after the navigator's shared data, in `loadShared`, once no update waits
  ([0064](/decisions/0064-the-navigator-loads-once-the-updates-are-applied.md)); while one waits, it logs
  `server: the navigator and the catalogue wait for the database updates`.
- The READMEs of `packages/virtual` and `packages/server` describe them.
- In `packages/virtual`, `go vet ./...` and `go test ./... -race` pass, with `TestTheDefinitionsLoadByID`,
  `TestTheCatalogueLoadsItsPagesInOrder`, `TestAnItemComesWithItsFurni` and `TestPagesReturnsACopyOfItsList`. In
  `packages/server`, `go test ./... -race` passes, with `TestTheServerStartsWithTheCatalogue`, and
  `TestTheNavigatorWaitsForTheUpdates` now waits for the catalogue's update too. `make gates` passes.

# Notes

- Runs on the branch `s5-catalogue-state`.
