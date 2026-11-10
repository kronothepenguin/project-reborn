---
type: Task
title: Load and unload rooms in virtual
description: virtual/room keeps each loaded room with its floor and its habbos, their positions and statuses, the doorbell, the queue and the spectators; a room loads with its first habbo and unloads with its last.
status: todo
phase: s4
depends_on: [s4-01]
packages: [packages/virtual, packages/server]
client: []
timestamp: 2026-11-10T16:42:08+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
---

# Goal

A room in use lives in `virtual/room` ([0060](/decisions/0060-virtual-category-model-and-room.md)), only in memory
([0011](/decisions/0011-saved-and-memory-only-data.md)).

# Steps

- [ ] `virtual/room` keeps each loaded room: its floor, from its model's heightmap, and its public furni; its habbos, each
  with a room index, a position, a direction and statuses; and those waiting at its doorbell, in its queue or watching
  as spectators ([0069](/decisions/0069-doorbell-queue-and-spectators-in-memory.md)).
- [ ] A room loads with its first habbo and unloads with its last ([0071](/decisions/0071-an-empty-room-unloads-at-once.md));
  `Visitors` counts from the loaded rooms.
- [ ] Tests: loading, unloading, room indexes, and safety for concurrent use.

# Verification

```sh
cd packages/virtual && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s4-loaded-rooms`.
