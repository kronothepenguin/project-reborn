---
type: Task
title: Move furni and habbos on rollers
description: The room's clock moves what stands on a roller one tile on, furni and habbos together, as 230.
status: done
phase: s5
depends_on: [s5-08]
packages: [packages/virtual, packages/server]
client: ["packages/client-r26/src/game/hh_room/5_Room Handler Class.ls", "packages/client-r26/src/game/hh_furni_classes/43_Queue Class.ls"]
timestamp: 2026-11-11T17:56:50+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T17:56:50+00:00"}
---

# Goal

Rollers carry furni and habbos ([hh_room](/reference/r26/hh_room.md), 230).

# Steps

- [x] On the room's clock ([0072](/decisions/0072-each-loaded-room-runs-its-own-clock.md)), each roller moves the furni
  and the habbo on it to the next tile in its direction, as one 230.
- [x] Nothing moves onto a tile that is taken or blocked.
- [x] A furni's new place is saved ([0010](/decisions/0010-hot-data-written-at-once.md)).
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

Results:

- Holo's server had no rollers: its ten were solids that blocked their tiles. The store's `furni_definitions` takes a
  new kind, `roller`, with the update `0016-rollers.sql`, which rebuilds the table and gives the kind to the definitions
  465 to 474. A roller's tile is open, and habbos and furni stand at its top, half a tile up.
- The room's clock runs `game.roll` every 2 seconds, every fourth tick
  ([0072](/decisions/0072-each-loaded-room-runs-its-own-clock.md),
  [0107](/decisions/0107-rollers-roll-every-two-seconds.md)). The rules it follows, the real hotel's:
  - a roller carries the furni of one tile that stand on it, and the habbo that stands still on it, together, one tile
    the way it points;
  - the next tile must be on the floor, hold no habbo and no furni but a roller, on whose top things land, and take
    furni by the model when furni comes;
  - a roller ahead moves its load first, so a line of rollers passes a row of things along in one go;
  - a habbo that walks is not carried, and what cannot move stays and tries again.
- A roll runs as one change to the room's furni, like placing: each furni's new place is saved, then the room's copy
  changes ([0010](/decisions/0010-hot-data-written-at-once.md)), and the room gets 230 with the two tiles, each furni's
  id and altitudes, the roller's id, and the move type 2 with the habbo's index and heights when one slid along, else 0.
  The habbo's status follows on the clock's next tick.
- In `packages/store`, `go test ./...` passes with the ten rollers checked; in `packages/virtual`, `go test ./... -race`
  passes. In `packages/server`, `go test ./... -race` passes, with `TestRollersCarryFurniAndHabbos`: a lamp rides two
  rollers onto the floor, a habbo rides one and stops before a die, and nothing rolls after. `make gates` passes.

# Notes

- Runs on the branch `s5-rollers`.
- Settled before it started: rollers roll, every 2 seconds, by the real hotel's rules
  ([0107](/decisions/0107-rollers-roll-every-two-seconds.md)), which Holo never had.
