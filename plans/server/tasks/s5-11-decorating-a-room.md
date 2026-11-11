---
type: Task
title: Decorate a room
description: FLATPROPBYITEM uses a wallpaper, a floor or a landscape from the hand on the room, saved with it and told to the room as 46.
status: todo
phase: s5
depends_on: [s5-05]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_room_utils/18_Container Hand Class.ls", "packages/client-r26/src/game/hh_cat_code/9_Catalogue spaces Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

A room keeps its wallpaper, its floor and its landscape ([hh_room](/reference/r26/hh_room.md), 46).

# Steps

- [ ] The store keeps a room's wallpaper, floor and landscape; an update with them, queries, tests and the OKF concepts,
  with the `adding-data-persistence` skill.
- [ ] `FLATPROPBYITEM` (66) uses up a wallpaper, a floor or a landscape of the habbo's hand on the room it is in: the
  room is saved, and everyone in it gets 46.
- [ ] A habbo arriving gets the room's 46.
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-decorating-a-room`.
- To settle before it starts:
  - Who decorates; Holo let any habbo with rights.
