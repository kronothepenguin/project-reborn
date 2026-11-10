---
type: Task
title: Browse the navigator's categories
description: NAVIGATE gets the category's sub-categories and its public rooms or habbo rooms, with the habbos in each, GETUSERFLATCATS the categories a habbo may use, GETPARENTCHAIN a category's parents, and GETSPACENODEUSERS who is in a public room.
status: done
phase: s3
depends_on: [s3-02]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_navigator/5_Navigator Component Class.ls", "packages/client-r26/src/game/hh_navigator/6_Navigator Handler Class.ls"]
timestamp: 2026-11-10T11:46:59+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T11:46:59+00:00"}
---

# Goal

A habbo browses the navigator's categories ([hh_navigator](/reference/r26/hh_navigator.md), Browsing).

# Steps

- [x] `NAVIGATE` (150) gets 220: the category asked for, then its sub-categories and its public rooms, or its habbo
  rooms, at most `game.categoryMaxRooms` ([0061](/decisions/0061-navigator-lists-show-up-to-30-rooms.md)), each with its
  habbos counted in memory. A public room carries its unit, port, door, casts, queue and visibility as `hh_room` reads
  them ([s1-06](/tasks/s1-06-room.md)); the node mask 1 leaves full rooms out; a category whose level is above the
  habbo's and that hides itself is left out.
- [x] `GETUSERFLATCATS` (151) gets 221 with the categories of habbo rooms that the habbo's level may put a room in.
- [x] `GETPARENTCHAIN` (156) gets 227 with a category's parents, nearest first.
- [x] `GETSPACENODEUSERS` (154) gets 223 with the names of the habbos in a public room, none until S4.
- [x] A habbo room that hides its owner shows no owner, except to holders of `fuse_see_all_roomowners`
  ([0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md)).
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- `game.Browse` returns what a habbo sees of a category: the category and the categories right under it, each with the
  habbos in its rooms and the most they take, and its public rooms or its habbo rooms, at most `game.categoryMaxRooms`
  ([0061](/decisions/0061-navigator-lists-show-up-to-30-rooms.md)), sorted by habbos in them, without the full rooms on
  request. A category that hides itself from the habbo's level is left out. `game.RoomCategories` returns the categories
  a habbo may put a room in: those of habbo rooms below the root that its level reaches, as Holo's `SETFLATCAT` check
  had them.
- `r26/navigator.go` serves `NAVIGATE` (220), `GETUSERFLATCATS` (221), `GETPARENTCHAIN` (227) and `GETSPACENODEUSERS`
  (223, nobody until S4), and names hh_navigator's 18 commands in the log. A public room's port is its id and its door
  0, as Holo gave them. A habbo room that hides its owner shows `-`, except to its owner and to holders of
  `fuse_see_all_roomowners` ([0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md)).
- The store's `SumCategoryMaxVisitors` gives a category's habbo rooms' capacity, and `virtual/category` gets `All`.
  A category's 30 habbo rooms are the first 30 by id, then sorted by habbos in them; once S4 fills rooms, the busiest
  may lie beyond them.
- `go test ./... -race` passes in `packages/server`, with `TestNavigatingThePublicRooms`,
  `TestNavigatingAHabboRoomsCategory`, `TestNavigatingGuestroomsListsItsCategories`, `TestHidingFullRooms`,
  `TestTheCategoriesAHabboMayUse`, `TestAParentChain` and `TestThoseInAPublicRoom`; in `packages/virtual`, with
  `TestAllListsEveryCategoryByID`; and in `packages/store`, with `make check-docs` exiting 0.
- The README of `packages/server` describes the navigator.

# Notes

- Runs on the branch `s3-browsing`.
