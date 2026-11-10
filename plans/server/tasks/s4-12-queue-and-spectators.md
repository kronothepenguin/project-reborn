---
type: Task
title: Queue for full rooms and watch as a spectator
description: A full room queues its arriving habbos and takes spectators, as the R26 client shows them, in memory.
status: todo
phase: s4
depends_on: [s4-03]
packages: [packages/server, packages/virtual]
client: []
timestamp: 2026-11-10T19:40:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T19:40:12+00:00"}
---

# Goal

Full rooms queue habbos and take spectators ([0080](/decisions/0080-full-rooms-queue-and-take-spectators-in-s4.md)).

# Steps

- [ ] The queue's details are asked and settled: which rooms queue, the queue sets, a priority for club members, and
  the spectators' limit.
- [ ] 259 and `ROOM_QUEUE_CHANGE` (211) for the queue; 254, 283, 298 and `GET_SPECTATOR_AMOUNT` (216) for the
  spectators, in memory ([0069](/decisions/0069-doorbell-queue-and-spectators-in-memory.md)).
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s4-queue-and-spectators`.
- Split from [s4-07](/tasks/s4-07-room-extras.md).
