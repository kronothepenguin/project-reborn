---
type: Task
title: Keep furni in the hand
description: The store gets the furni items, each belonging to a user and held by a habbo, shared or placed in a room; GETSTRIP sends the hand a page at a time as 140, read from the database.
status: todo
phase: s5
depends_on: [s5-02]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_room/5_Room Handler Class.ls", "packages/client-r26/src/game/hh_room_utils/18_Container Hand Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

A habbo carries its furni in its hand ([0096](/decisions/0096-the-hand-is-read-from-the-database.md),
`plans/holo-port/decisions/0057-furni-and-rooms.md`).

# Steps

- [ ] A table for the furni items: each has its definition, the user it belongs to, the habbo that holds it, none for
  the shared inventory, the room it stands in with its place there, and its state; an update with it, queries, tests and
  the OKF concepts, with the `adding-data-persistence` skill.
- [ ] `GETSTRIP` (65) answers 140 with a page of the hand, for `new`, `update`, `next` and `prev`, read from the store
  each time ([0096](/decisions/0096-the-hand-is-read-from-the-database.md)); the page a habbo is on lives in memory.
- [ ] 140 marks each furni recyclable or not, and gives a wall item's data and a floor furni's size, colours and state
  ([hh_room](/reference/r26/hh_room.md#the-hand)).
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-the-hand`.
- To settle before it starts:
  - How many furni a page of the hand holds; Holo sent 9.
  - Whether a hand has a most furni; Holo had none.
  - The hand's order; Holo listed the oldest furni first.
