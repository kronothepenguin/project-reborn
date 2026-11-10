---
type: Task
title: Walk
description: MOVE walks a habbo to a tile a step every 500 ms by Holo's rules, LOOKTO turns it, and every room's habbos see the steps in 34.
status: todo
phase: s4
depends_on: [s4-03]
packages: [packages/server, packages/virtual]
client: ["packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-10T16:42:08+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
---

# Goal

Habbos walk ([0065](/decisions/0065-walking-500-ms-by-holos-rules.md)).

# Steps

- [ ] `MOVE` (75) walks the habbo to a tile, a step every 500 ms, along a path in 8 directions, a diagonal only when both
  tiles beside it are free, up or down at most 1 height, around blocked tiles and other habbos.
- [ ] `LOOKTO` (79) turns the habbo to a tile.
- [ ] Each step goes to the room's habbos as a status line in 34, with `mv` to the next tile.
- [ ] Tests: a path around a wall, no corner cut, a step too high refused, two habbos and the timing.

# Verification

```sh
cd packages/server && go test ./... -race
cd packages/virtual && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s4-walking`.
