---
type: Task
title: Load the navigator's shared data in virtual
description: virtual/category, virtual/model and virtual/room load the categories, the room models and the public rooms when the server starts, and count the habbos in each room in memory.
status: done
phase: s3
depends_on: [s3-01]
packages: [packages/virtual, packages/server]
client: []
timestamp: 2026-11-10T11:42:09+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T11:42:09+00:00"}
---

# Goal

The navigator's shared data is in memory from the server's start
([0009](/decisions/0009-virtual-holds-the-server-state.md)), in the packages of
[0060](/decisions/0060-virtual-category-model-and-room.md).

# Steps

- [x] `virtual/category`, `virtual/model` and `virtual/room` load the categories, the models and the public rooms from
  the store, and `server.New` loads them, or loads them once the updates waiting are applied
  ([0064](/decisions/0064-the-navigator-loads-once-the-updates-are-applied.md)).
- [x] `virtual/room` counts the habbos in each public room and habbo room, in memory only
  ([0011](/decisions/0011-saved-and-memory-only-data.md)); every count stays 0 until [S4](/phases/s4-rooms.md) lets
  habbos enter.
- [x] Tests: what loads, a lookup of each, and counts safe for concurrent use.

# Verification

```sh
cd packages/virtual && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

Results:

- `packages/virtual/category` keeps the categories as a tree: `Get`, `Children`, by id, and `Parents`, nearest first.
  `packages/virtual/model` keeps the models by name and id, and `packages/virtual/room` the public rooms by id and
  category ([0060](/decisions/0060-virtual-category-model-and-room.md)). Each `Load(ctx, db)` swaps in a whole new copy,
  so the getters take no lock and return copies.
- `virtual/room` counts the habbos in each room in memory, `Visitors`, `Enter` and `Leave` on a `Ref` that names a
  public room or a habbo room, never below 0; the counts stay 0 until S4.
- `server.New` loads the three at once, or, while updates wait, logs that the navigator waits and loads it with the
  first settings' reload after they are applied ([0064](/decisions/0064-the-navigator-loads-once-the-updates-are-applied.md)).
- `go test ./... -race` passes in `packages/virtual`, with `TestTheCategoriesLoadAsATree`,
  `TestChildrenReturnsACopy`, `TestTheModelsLoadByNameAndID`, `TestThePublicRoomsLoadByIDAndCategory` and
  `TestVisitorsAreCountedPerRoom`, and in `packages/server`, with `TestTheServerStartsWithTheNavigator` and
  `TestTheNavigatorWaitsForTheUpdates`.
- The READMEs of `packages/virtual` and `packages/server`, and [the architecture](/reference/architecture.md),
  describe them.

# Notes

- Runs on the branch `s3-navigator-state`.
