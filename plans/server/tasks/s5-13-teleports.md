---
type: Task
title: Travel through teleports
description: A teleport is bought as a pair; INTODOOR, GETDOORFLAT, DOORGOIN and GOVIADOOR take a habbo from one to the other, in the same room or another.
status: done
phase: s5
depends_on: [s5-05, s5-08]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_furni_classes/31_Furniture Teleport Class.ls", "packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-11T18:23:08+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T18:23:08+00:00"}
---

# Goal

A habbo walks into a teleport and comes out of its pair ([hh_room](/reference/r26/hh_room.md#teleports)).

# Steps

- [x] A purchase of a teleport gives two that know each other, saved; an update, queries, tests and the OKF concepts,
  with the `adding-data-persistence` skill.
- [x] `INTODOOR` (81) walks the habbo into the teleport from the tile in front of it; `GETDOORFLAT` (28) answers 62 with
  the other teleport and its room, and with nothing to go to while the other stands in no room; `DOORGOIN` (82) shows
  89.
- [x] `GOVIADOOR` (54) brings the habbo out of the other teleport, 92, entering its room when it is another.
- [x] Tests with the Go test client, across two rooms.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

Results:

- The store's `furni` gains `partner_furni_id`, the other teleport of a pair, with the update `0019-teleports.sql` and
  the query `SetFurniPartner`. A purchase of a `door`, `doorB`, `doorC`, `doorD` or `teleport_door` creates two furni
  that name each other, in the hand or, for a present, both in the box
  ([0111](/decisions/0111-a-teleport-keeps-its-partner.md)).
- `INTODOOR` (81) steps the habbo into the teleport from the tile it faces: a teleport's tile takes no walk, so
  `game.EnterTeleport` takes the step itself and tells the room at once, and the clock's next tick ends it.
- `GETDOORFLAT` (28) answers 62 with the other teleport and its room to a habbo that stands in the teleport, and opens
  its passage, kept in memory in `packages/virtual/room`; it answers nothing while the other stands in no room.
  `DOORGOIN` (82) shows the room 89.
- `GOVIADOOR` (54) takes the habbo through its passage. In the same room it stands in the other teleport at once, and
  the room gets its status and 92. Into another room, which it chose, it gets 41 and comes in past the doorbell, the
  password, a ban and a full room ([0110](/decisions/0110-a-teleport-skips-every-check-of-the-door.md)), arrives in the
  teleport, and the others get 92.
- In `packages/store`, `go vet ./...`, `go test ./...` and `make check-docs` pass. In `packages/server`,
  `go test ./... -race` passes, with `TestTeleports`: three pairs bought, a jump inside a room, a jump into a closed,
  full room the habbo is banned from, and a teleport whose partner is in a hand. `make gates` passes.

# Notes

- Runs on the branch `s5-teleports`.
- Settled before it started: a teleport takes a habbo past every check of the door
  ([0110](/decisions/0110-a-teleport-skips-every-check-of-the-door.md)), and keeps its partner whoever holds either
  ([0111](/decisions/0111-a-teleport-keeps-its-partner.md)).
- Chosen without asking: the five sprites Holo sold as pairs are the teleports, with no kind of their own; the server
  follows the client's messages, 62 for a partner in the same room too, where Holo moved the habbo itself; `GOVIADOOR`
  into another room answers 41 at once, where Holo answered 19 and waited for `TRYFLAT`; the passage a habbo opened with
  `GETDOORFLAT` is kept in memory, in `packages/virtual/room` beside its heading, and ends when it walks, enters a room
  or logs out; a habbo comes out of a teleport even while another stands in it, as in Holo.
