---
type: Task
title: Show a room's furni and walk around it
description: A room loads its floor furni and wall items and shows them as 32 and 45; furni shapes the floor, and habbos sit on seats and lie on beds.
status: done
phase: s5
depends_on: [s5-04]
packages: [packages/virtual, packages/server]
client: ["packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls", "packages/client-r26/src/game/hh_buffer/4_Buffer Handler Class.ls"]
timestamp: 2026-11-11T16:43:49+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T16:43:49+00:00"}
---

# Goal

A room shows the furni in it, and habbos live with it ([hh_room](/reference/r26/hh_room.md)).

# Steps

- [x] A habbo room loads its furni with it and drops it when it unloads
  ([0009](/decisions/0009-virtual-holds-the-server-state.md)); a habbo arriving gets the floor furni as 32, and
  `G_ITEMS` (63) answers 45 with the wall items.
- [x] Furni shapes the floor habbos walk on: a solid furni blocks its tiles, a rug and an open door do not, and a furni
  on another stands at its height.
- [x] A habbo that stops on a seat sits at the seat's height, turned as the seat is, and one that stops on a bed lies.
- [x] `hh_buffer` needs nothing of its own ([hh_buffer](/reference/r26/hh_buffer.md)).
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

Results:

- A habbo room loads the furni that stands in it with its rights and bans, each row with what it is from
  `virtual/furni`, and drops it when it unloads ([0009](/decisions/0009-virtual-holds-the-server-state.md)):
  `Room.Furni` lists it, and `Room.Floor` is the model's floor with the furni on it. The store gains `ListRoomFurni`.
- On each tile the highest furni decides, and of two as high the newer one, where Holo let the last one it loaded
  decide: a solid blocks the tile, unless it is a door whose state is `O`; a seat and a bed take a habbo at their top,
  their altitude and their height, facing their way; a rug leaves the tile open at its own altitude. A furni's length
  runs along x when it faces north or south and along y when it faces east or west, as Holo laid furni.
- The walking rules read the tile's level: a habbo walks at the floor's height, or at a rug's on a rug, and `mv` carries
  it; a seat or a bed is a way's goal only, and gives `sit` or `lay` with the height of its top, `sit 1` on a public
  seat as before and `lay 1.5` on a bed 1.5 high.
- `G_OBJS` (62) now sends 32 with the floor furni, each as an active object, and `G_ITEMS` (63) sends 45 with the wall
  items, a line each: the id, the class, a space where the owner goes, the place on the wall, and the item's state or,
  without one, its definition's data, a poster's number. A room that no habbo is in yet answers from the store, through
  `game.RoomFurni`, and a loaded one from its copy.
- `hh_buffer` needs nothing of its own: it holds the same messages while a class downloads
  ([hh_buffer](/reference/r26/hh_buffer.md)).
- Placing comes with [s5-08](/tasks/s5-08-placing-furni.md), so the tests stand furni in a room by writing its row.
- In `packages/virtual`, `go vet ./...` and `go test ./... -race` pass, with `TestAFurniCoversTilesByItsDirection`,
  `TestFurniShapesTheFloor`, `TestTheHighestFurniDecidesATile` and `TestAHabboRoomLoadsItsFurni`. In `packages/server`,
  `go test ./... -race` passes, with `TestARoomShowsItsFurniAndHabbosUseIt`: a habbo gets its room's 32 and 45, walks
  around a die, sits on a chair, lies on a bed, walks over a rug and cannot walk onto the die. `make gates` passes.

# Notes

- Runs on the branch `s5-furni-in-rooms`.
