---
type: Task
title: Travel through teleports
description: A teleport is bought as a pair; INTODOOR, GETDOORFLAT, DOORGOIN and GOVIADOOR take a habbo from one to the other, in the same room or another.
status: todo
phase: s5
depends_on: [s5-05, s5-08]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_furni_classes/31_Furniture Teleport Class.ls", "packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

A habbo walks into a teleport and comes out of its pair ([hh_room](/reference/r26/hh_room.md#teleports)).

# Steps

- [ ] A purchase of a teleport gives two that know each other, saved; an update, queries, tests and the OKF concepts,
  with the `adding-data-persistence` skill.
- [ ] `INTODOOR` (81) walks the habbo into the teleport from the tile in front of it; `GETDOORFLAT` (28) answers 62 with
  the other teleport and its room, and with nothing to go to while the other stands in no room; `DOORGOIN` (82) shows
  89.
- [ ] `GOVIADOOR` (54) brings the habbo out of the other teleport, 92, entering its room when it is another.
- [ ] Tests with the Go test client, across two rooms.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-teleports`.
- To settle before it starts:
  - Whether a teleport takes a habbo into a room past its door, its password, its ban and its last free place.
  - What happens to a pair when one of the two is traded, given or recycled.
