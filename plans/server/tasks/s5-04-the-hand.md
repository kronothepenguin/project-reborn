---
type: Task
title: Keep furni in the hand
description: The store gets the furni items, each belonging to a user and held by a habbo, shared or placed in a room; GETSTRIP sends the hand a page at a time as 140, read from the database.
status: done
phase: s5
depends_on: [s5-02]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_room/5_Room Handler Class.ls", "packages/client-r26/src/game/hh_room_utils/18_Container Hand Class.ls"]
timestamp: 2026-11-11T16:28:03+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T16:28:03+00:00"}
---

# Goal

A habbo carries its furni in its hand ([0096](/decisions/0096-the-hand-is-read-from-the-database.md),
`plans/holo-port/decisions/0057-furni-and-rooms.md`).

# Steps

- [x] A table for the furni items: each has its definition, the user it belongs to, the habbo that holds it, none for
  the shared inventory, the room it stands in with its place there, and its state; an update with it, queries, tests and
  the OKF concepts, with the `adding-data-persistence` skill.
- [x] `GETSTRIP` (65) answers 140 with a page of the hand, for `new`, `update`, `next` and `prev`, read from the store
  each time ([0096](/decisions/0096-the-hand-is-read-from-the-database.md)); the page a habbo is on lives in memory.
- [x] 140 marks each furni recyclable or not, and gives a wall item's data and a floor furni's size, colours and state
  ([hh_room](/reference/r26/hh_room.md#the-hand)).
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

Results:

- `packages/store/schema/furni.schema.sql` declares `furni`, a piece of furni: its definition, the user it belongs to,
  the habbo whose hand holds it, the room it stands in with its tile, altitude, direction or wall position, and its
  state. A piece is in a hand, in a room, or, with neither, in its user's shared inventory, and a CHECK keeps it out of
  a hand and a room at once (`plans/holo-port/decisions/0057-furni-and-rooms.md`). The update `0014-furni.sql` creates
  it and seeds nothing.
- Queries: `CreateFurni`, `CountHandFurni` and `ListHandFurni`, a page of a hand by id.
- `game.HandPage` reads a page of nine furni from the store each time, with what each furni is from `virtual/furni`
  ([0096](/decisions/0096-the-hand-is-read-from-the-database.md)): a page before the first gives the first, and one past
  the last the last.
- `r26/room_hand.go` answers `GETSTRIP` (65) with 140: `new` the first page, `next` and `prev` the one after and before,
  `update` the same again. The session keeps the page the client is on. Each furni is `SI`, its strip id, its place in
  the whole hand, `S` or `I`, its id and its class, then a floor furni's length, width, state, colours and recyclable
  flag, or a wall item's data and recyclable flag, the values separated by the character 30 and the furni ended by a
  slash; the count of the whole hand follows a carriage return. The strip id is the furni's id, as in Holo.
- Holo sent the sprite once more as a floor furni's twelfth value, where the client reads a slot id for the sound
  machine; the server leaves it out until [S7](/phases/s7-club-help-extras.md).
- A slash or a control character in a state becomes a space in 140, so no state breaks the list.
- In `packages/store`, `go vet ./...`, `go test ./...` and `make check-docs` pass, with
  `TestAHandListsItsFurniOldestFirst` and `TestAFurniIsNeverInAHandAndARoom`. In `packages/server`,
  `go test ./... -race` passes, with `TestTheHandComesAPageAtATime`, 11 furni over two pages and a twelfth seen by
  `update`, `TestAnEmptyHand` and, in `r26`, `TestAHandValueKeepsItsPlace`. `make gates` passes.

# Notes

- Runs on the branch `s5-the-hand`.
- Chosen without asking, each as Holo had it: a page of nine furni, which is also what the client's hand shows; no most
  furni in a hand; and the oldest furni first.
