---
type: Task
title: Move furni and habbos on rollers
description: The room's clock moves what stands on a roller one tile on, furni and habbos together, as 230.
status: todo
phase: s5
depends_on: [s5-08]
packages: [packages/virtual, packages/server]
client: ["packages/client-r26/src/game/hh_room/5_Room Handler Class.ls", "packages/client-r26/src/game/hh_furni_classes/43_Queue Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

Rollers carry furni and habbos ([hh_room](/reference/r26/hh_room.md), 230).

# Steps

- [ ] On the room's clock ([0072](/decisions/0072-each-loaded-room-runs-its-own-clock.md)), each roller moves the furni
  and the habbo on it to the next tile in its direction, as one 230.
- [ ] Nothing moves onto a tile that is taken or blocked.
- [ ] A furni's new place is saved ([0010](/decisions/0010-hot-data-written-at-once.md)).
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-rollers`.
- To settle before it starts:
  - How often rollers move.
  - What a roller does with a stack of furni, and with a habbo that is walking.
