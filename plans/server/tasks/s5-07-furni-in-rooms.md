---
type: Task
title: Show a room's furni and walk around it
description: A room loads its floor furni and wall items and shows them as 32 and 45; furni shapes the floor, and habbos sit on seats and lie on beds.
status: todo
phase: s5
depends_on: [s5-04]
packages: [packages/virtual, packages/server]
client: ["packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls", "packages/client-r26/src/game/hh_buffer/4_Buffer Handler Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

A room shows the furni in it, and habbos live with it ([hh_room](/reference/r26/hh_room.md)).

# Steps

- [ ] A habbo room loads its furni with it and drops it when it unloads
  ([0009](/decisions/0009-virtual-holds-the-server-state.md)); a habbo arriving gets the floor furni as 32, and
  `G_ITEMS` (63) answers 45 with the wall items.
- [ ] Furni shapes the floor habbos walk on: a solid furni blocks its tiles, a rug and an open door do not, and a furni
  on another stands at its height.
- [ ] A habbo that stops on a seat sits at the seat's height, turned as the seat is, and one that stops on a bed lies.
- [ ] `hh_buffer` needs nothing of its own ([hh_buffer](/reference/r26/hh_buffer.md)).
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-furni-in-rooms`.
