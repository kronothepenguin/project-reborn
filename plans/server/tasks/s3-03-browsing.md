---
type: Task
title: Browse the navigator's categories
description: NAVIGATE gets the category's sub-categories and its public rooms or habbo rooms, with the habbos in each, GETUSERFLATCATS the categories a habbo may use, GETPARENTCHAIN a category's parents, and GETSPACENODEUSERS who is in a public room.
status: todo
phase: s3
depends_on: [s3-02]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_navigator/5_Navigator Component Class.ls", "packages/client-r26/src/game/hh_navigator/6_Navigator Handler Class.ls"]
timestamp: 2026-11-10T03:40:35+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
---

# Goal

A habbo browses the navigator's categories ([hh_navigator](/reference/r26/hh_navigator.md), Browsing).

# Steps

- [ ] `NAVIGATE` (150) gets 220: the category asked for, then its sub-categories and its public rooms, or its habbo
  rooms, at most `game.categoryMaxRooms` ([0061](/decisions/0061-navigator-lists-show-up-to-30-rooms.md)), each with its
  habbos counted in memory. A public room carries its unit, port, door, casts, queue and visibility as `hh_room` reads
  them ([s1-06](/tasks/s1-06-room.md)); the node mask 1 leaves full rooms out; a category whose level is above the
  habbo's and that hides itself is left out.
- [ ] `GETUSERFLATCATS` (151) gets 221 with the categories of habbo rooms that the habbo's level may put a room in.
- [ ] `GETPARENTCHAIN` (156) gets 227 with a category's parents, nearest first.
- [ ] `GETSPACENODEUSERS` (154) gets 223 with the names of the habbos in a public room, none until S4.
- [ ] A habbo room that hides its owner shows no owner, except to holders of `fuse_see_all_roomowners`
  ([0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md)).
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s3-browsing`.
