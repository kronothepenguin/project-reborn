---
type: Task
title: Decorate a room
description: FLATPROPBYITEM uses a wallpaper, a floor or a landscape from the hand on the room, saved with it and told to the room as 46.
status: done
phase: s5
depends_on: [s5-05]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_room_utils/18_Container Hand Class.ls", "packages/client-r26/src/game/hh_cat_code/9_Catalogue spaces Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-11T18:00:44+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T18:00:44+00:00"}
---

# Goal

A room keeps its wallpaper, its floor and its landscape ([hh_room](/reference/r26/hh_room.md), 46).

# Steps

- [x] The store keeps a room's wallpaper, floor and landscape; an update with them, queries, tests and the OKF concepts,
  with the `adding-data-persistence` skill.
- [x] `FLATPROPBYITEM` (66) uses up a wallpaper, a floor or a landscape of the habbo's hand on the room it is in: the
  room is saved, and everyone in it gets 46.
- [x] A habbo arriving gets the room's 46.
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

Results:

- The store's `rooms` gains `wallpaper`, `floor` and `landscape`, the patterns a room was decorated with, empty for the
  model's own, with the update `0017-room-decorations.sql`. Queries: `SetRoomWallpaper`, `SetRoomFloor`,
  `SetRoomLandscape` and `DeleteHandFurni`.
- `game.Decorate` handles `FLATPROPBYITEM` (66), `<class>/<strip id>`: a habbo that controls the room, as Holo let it,
  uses up a wallpaper, a floor or a landscape of its own hand. In one transaction the room keeps the pattern the furni
  was bought with ([s5-05](/tasks/s5-05-buying-furni.md)) and the furni is deleted; the room then gets 46,
  `<property>/<pattern>`.
- `GOTOFLAT` sends 46 after 69 for each of the room's landscape, wallpaper and floor that was set, in Holo's order.
- In `packages/store`, `go vet ./...`, `go test ./...` and `make check-docs` pass. In `packages/server`,
  `go test ./... -race` passes, with `TestDecoratingARoom`: three decorations used up, refused without rights and for
  the wrong furni, and sent to a habbo that comes in later. `make gates` passes.

# Notes

- Runs on the branch `s5-decorating-a-room`.
- Chosen without asking, as Holo had it: a habbo that controls the room decorates it, with a furni of its own hand.
