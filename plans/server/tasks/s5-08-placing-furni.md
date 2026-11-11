---
type: Task
title: Place, move, turn and pick up furni
description: PLACESTUFF, MOVESTUFF and ADDSTRIPITEM place furni from the hand, move and turn it, and pick it up, saved at once; a deleted room's furni goes to its owner's hand.
status: done
phase: s5
depends_on: [s5-07]
packages: [packages/store, packages/virtual, packages/server]
client: ["packages/client-r26/src/game/hh_room/3_Room Interface Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls", "packages/client-r26/src/game/hh_room_utils/17_Object Mover Class.ls", "packages/client-r26/src/game/hh_room_utils/18_Container Hand Class.ls", "packages/client-r26/src/game/hh_furni_classes/3_Active Object Class.ls", "packages/client-r26/src/game/hh_furni_classes/5_Item Object Class.ls"]
timestamp: 2026-11-11T17:14:26+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T17:14:26+00:00"}
---

# Goal

Habbos furnish rooms, and nothing placed is lost ([0010](/decisions/0010-hot-data-written-at-once.md),
[0011](/decisions/0011-saved-and-memory-only-data.md)).

# Steps

- [x] `PLACESTUFF` (90) places a floor furni on a tile, turned, or a wall item on a wall, from the placer's hand; the
  room sees 93 or 83, and the row is written before the copy in memory changes
  ([0010](/decisions/0010-hot-data-written-at-once.md)).
- [x] `MOVESTUFF` (73) moves or turns a floor furni, 95; `ADDSTRIPITEM` (67) picks a floor furni or a wall item up into
  the hand, 94 or 84; `REMOVESTUFF` (99) and `REMOVEITEM` (85) delete one.
- [x] A place is refused when the furni does not fit there: off the floor, on the door, on a furni that carries nothing,
  or where a habbo stands.
- [x] A habbo sitting or lying on a furni that is moved or picked up stands up.
- [x] `DELETEFLAT` sends the room's furni to its owner's hand before the room goes
  ([0059](/decisions/0059-a-deleted-rooms-furni-goes-to-its-owner.md)).
- [x] Tests with the Go test client: furni placed, moved and picked up, and still in its place after the room unloads
  and loads again.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

Results:

- `game.PlaceFurni` and `game.PlaceWallItem` stand a furni of the placer's hand in the habbo room it is in,
  `game.MoveFurni` moves or turns a floor furni, and `game.PickUpFurni` takes one into the picker's hand. The owner, the
  habbos with rights and the holders of `fuse_any_room_controller` place and move; only the owner and those holders pick
  up, and what they pick up becomes their user's, whoever placed it
  ([0103](/decisions/0103-whoever-picks-a-furni-up-keeps-it.md)).
- A floor furni fits where every tile it covers takes furni, by the rules of Holo's `placeItem`: a tile the model allows
  with nothing on it, a solid that has a height, on whose top it stands, or a rug, 0.1 above which it stands; never a
  seat, a bed, a flat solid or a tile where a habbo stands. It stands no higher than `game.maxStackHeight`, 20, Holo's
  `items_stacking_maxstackheight`. A seat that is moved may come under a habbo, which then sits, as Holo's
  `relocateItem` allowed. One rule serves placing and moving, where Holo's two differed.
- A tile of the floor now says where more furni stands, `Placeable` and `Top`, and the loaded room changes its furni
  with `SetFurni` and `RemoveFurni`, which lay its floor again; `FloorWithout` tells where a furni may move, and
  `Furnish` runs one change to a room's furni at a time. Each change writes its row with a guard, the hand for a place
  and the room for a move or a pick-up, then the room's copy, then tells the room
  ([0010](/decisions/0010-hot-data-written-at-once.md)). A habbo on a tile that changed sits, lies or stands as the
  floor now has it.
- `r26` handles `PLACESTUFF` (90), `MOVESTUFF` (73) and `ADDSTRIPITEM` (67). The room gets 93 or 83 for a furni placed,
  95 for one moved and 94 or 84 for one picked up, and the picker its hand, 140, as Holo sent it. A move that is refused
  answers its mover alone with 95, the furni where it stands, since the client moved it already.
- A room holds at most `game.maxRoomFurni` furni, 500, a setting of the Game form with `game.maxStackHeight`
  ([0104](/decisions/0104-a-room-holds-up-to-500-furni.md)).
- `DELETEFLAT` moves the room's furni to its owner's hand in the transaction that deletes the room
  ([0059](/decisions/0059-a-deleted-rooms-furni-goes-to-its-owner.md)).
- The client's furni window never shows its delete button, so nothing sends `REMOVESTUFF`, and Holo had no handler for
  it either: it stays unhandled. `REMOVEITEM` is the post-its' ([s5-12](/tasks/s5-12-post-its.md)).
- In `packages/store`, `go vet ./...`, `go test ./...` and `make check-docs` pass. In `packages/virtual`,
  `go test ./... -race` passes, with `TestWhereMoreFurniMayStand` and `TestARoomsFloorFollowsItsFurni`. In
  `packages/server`, `go test ./... -race` passes, with `TestFurnishingARoom`, three habbos placing, stacking, moving,
  sitting, picking up and coming back to the room loaded again, and `TestADeletedRoomsFurniGoesToItsOwner`. `make gates`
  passes.

# Notes

- Runs on the branch `s5-placing-furni`.
- Settled before it started: whoever picks a furni up keeps it
  ([0103](/decisions/0103-whoever-picks-a-furni-up-keeps-it.md)), and a room holds up to 500 furni
  ([0104](/decisions/0104-a-room-holds-up-to-500-furni.md)).
- Chosen without asking: furni stacks by Holo's rules, no higher than Holo's 20, as the setting `game.maxStackHeight`;
  `fuse_pick_up_any_furni` opens presents in the client and nothing here, so it waits for
  [s5-06](/tasks/s5-06-presents.md); and `REMOVESTUFF` is not handled, since the client shows no button that deletes a
  furni.
