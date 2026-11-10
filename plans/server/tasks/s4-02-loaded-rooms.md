---
type: Task
title: Load and unload rooms in virtual
description: virtual/room keeps each loaded room with its floor and its habbos, their positions and statuses, the doorbell, the queue and the spectators; a room loads with its first habbo and unloads with its last.
status: done
phase: s4
depends_on: [s4-01]
packages: [packages/virtual, packages/server]
client: []
timestamp: 2026-11-10T17:15:33+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T17:15:33+00:00"}
---

# Goal

A room in use lives in `virtual/room` ([0060](/decisions/0060-virtual-category-model-and-room.md)), only in memory
([0011](/decisions/0011-saved-and-memory-only-data.md)).

# Steps

- [x] `virtual/room` keeps each loaded room: its floor, from its model's heightmap, and its public furni; its habbos, each
  with a room index, a position, a direction and statuses; and those waiting at its doorbell, in its queue or watching
  as spectators ([0069](/decisions/0069-doorbell-queue-and-spectators-in-memory.md)).
- [x] A room loads with its first habbo and unloads with its last ([0071](/decisions/0071-an-empty-room-unloads-at-once.md));
  `Visitors` counts from the loaded rooms.
- [x] Tests: loading, unloading, room indexes, and safety for concurrent use.

# Verification

```sh
cd packages/virtual && go test ./... -race
make gates
```

Results:

- `packages/virtual/room` keeps the loaded rooms: `Enter(ctx, db, ref, avatarID, s, limit)` puts a habbo at the
  model's door tile, height and direction, with the smallest index nobody in the room holds, from 0, as Holo's
  `getFreeRoomIdentifier` gave it, and loads a room that is not loaded, its floor from its model and a habbo room's
  rights and bans in force from the store ([0009](/decisions/0009-virtual-holds-the-server-state.md)). It refuses a
  habbo already in a room, a room at its limit, under the same lock as the entry so that two habbos cannot take the
  last place, and a room that does not exist.
- `Leave(avatarID, s)` takes the habbo out while `s` plays it; the last one out unloads the room
  ([0071](/decisions/0071-an-empty-room-unloads-at-once.md)): `Done()` closes, for the room's clock
  ([0072](/decisions/0072-each-loaded-room-runs-its-own-clock.md)), and `Left.Waiting` hands back the doorbell, the
  queue and the spectators ([0069](/decisions/0069-doorbell-queue-and-spectators-in-memory.md)). Holo turned a ringer
  away at once from a room that was not loaded, so ringing never keeps a room loaded.
- A `Room` gives its model, floor, occupants by index, `Update` of a habbo's place and statuses, the copies of its
  rights and bans, and the three lines; once unloaded, it changes nothing. `Visitors(ref)` counts from the loaded
  rooms, in place of S3's counter, and the navigator's `TestHidingFullRooms` fills its room with 25 real occupants.
- `ParseFloor(model)` reads the height map as the client's Room Geometry Class reads 31: `x` blocked in either case, as
  Lingo compares; a digit its height; `A` to `H` the heights 0 to 7 and `y` 0, where nothing may be placed; any other
  character, such as the theater's `O`, open at 0, as Holo read it; empty lines skipped. Public furni block (1) or seat
  (2) their tiles, an eighth field, as `pool_a` has, is ignored, and the door's tile is always open at the door's
  height, as Holo had it. The eight models whose furni Holo's data lists without a state (`cafe`, `cinema`, `den`,
  `gardens`, `rumble`, `square_1`, `square_2`, `terace`) do not parse; no public room uses them.
- The store has `ListRoomBans`, the bans in force in a room.
- In `packages/virtual`, `go vet ./...` and `go test ./... -race` pass, with
  `TestARoomLoadsWithItsFirstHabboAndUnloadsWithItsLast`, `TestAHabboIsInOneRoomAtMost`,
  `TestAFullRoomRefusesTheNextHabbo`, `TestAHabboRoomLoadsItsRightsAndBans`, `TestTheLinesLastUntilTheRoomUnloads`,
  `TestUpdateChangesAPlaceButNotWhoHoldsIt`, `TestRoomsAreSafeForConcurrentUse`,
  `TestTheFloorReadsTheHeightMapAsTheClientDoes`, `TestAPublicRoomsFurniBlocksAndSeats`, `TestABrokenFloorIsRefused`
  and `TestTheSeededModelsParse`; `packages/server` and `packages/store` pass, and `make check-docs` exits 0.

# Notes

- Runs on the branch `s4-loaded-rooms`.
