---
type: Task
title: Place, move, turn and pick up furni
description: PLACESTUFF, MOVESTUFF and ADDSTRIPITEM place furni from the hand, move and turn it, and pick it up, saved at once; a deleted room's furni goes to its owner's hand.
status: todo
phase: s5
depends_on: [s5-07]
packages: [packages/store, packages/virtual, packages/server]
client: ["packages/client-r26/src/game/hh_room/3_Room Interface Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls", "packages/client-r26/src/game/hh_room_utils/17_Object Mover Class.ls", "packages/client-r26/src/game/hh_room_utils/18_Container Hand Class.ls", "packages/client-r26/src/game/hh_furni_classes/3_Active Object Class.ls", "packages/client-r26/src/game/hh_furni_classes/5_Item Object Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

Habbos furnish rooms, and nothing placed is lost ([0010](/decisions/0010-hot-data-written-at-once.md),
[0011](/decisions/0011-saved-and-memory-only-data.md)).

# Steps

- [ ] `PLACESTUFF` (90) places a floor furni on a tile, turned, or a wall item on a wall, from the placer's hand; the
  room sees 93 or 83, and the row is written before the copy in memory changes
  ([0010](/decisions/0010-hot-data-written-at-once.md)).
- [ ] `MOVESTUFF` (73) moves or turns a floor furni, 95; `ADDSTRIPITEM` (67) picks a floor furni or a wall item up into
  the hand, 94 or 84; `REMOVESTUFF` (99) and `REMOVEITEM` (85) delete one.
- [ ] A place is refused when the furni does not fit there: off the floor, on the door, on a furni that carries nothing,
  or where a habbo stands.
- [ ] A habbo sitting or lying on a furni that is moved or picked up stands up.
- [ ] `DELETEFLAT` sends the room's furni to its owner's hand before the room goes
  ([0059](/decisions/0059-a-deleted-rooms-furni-goes-to-its-owner.md)).
- [ ] Tests with the Go test client: furni placed, moved and picked up, and still in its place after the room unloads
  and loads again.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-placing-furni`.
- To settle before it starts:
  - Who places and moves, and who owns a furni that a habbo with rights places in another habbo's room; Holo let habbos
    with rights place and move, only the owner pick up, and what the owner picked up became its own.
  - What `fuse_pick_up_any_furni` lets staff do.
  - How high furni stacks, and on what.
  - Whether a room has a most furni.
  - Whether `REMOVESTUFF` and `REMOVEITEM` destroy a furni for good, and who may.
