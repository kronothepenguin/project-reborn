---
type: Task
title: Read, change and delete a room
description: GETFLATINFO and GETFLATCAT read a room's settings and category; UPDATEFLAT, SETFLATINFO and SETFLATCAT let its owner change them, and DELETEFLAT deletes it.
status: done
phase: s3
depends_on: [s3-06]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_navigator/5_Navigator Component Class.ls", "packages/client-r26/src/game/hh_navigator/6_Navigator Handler Class.ls"]
timestamp: 2026-11-10T11:58:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T11:58:46+00:00"}
---

# Goal

A room's owner reads and changes its settings, and deletes it ([hh_navigator](/reference/r26/hh_navigator.md), Changing
a room).

# Steps

- [x] `GETFLATINFO` (21) gets 54 with the room's settings; a room that hides its owner shows none, as in
  [s3-03](/tasks/s3-03-browsing.md).
- [x] `GETFLATCAT` (152) gets 222 with the room's category.
- [x] `UPDATEFLAT` (24) changes the name, the door and whether to show the owner; `SETFLATINFO` (25), the navigator's
  form, and `SETFLATCAT` (153) as in [s3-06](/tasks/s3-06-creating-a-room.md). Only the owner may, by the rules of
  [0056](/decisions/0056-own-rooms-follow-holos-rules.md).
- [x] `DELETEFLAT` (23) lets the owner delete the room, with the favourites that name it. Its furni goes to the owner's
  hand once [S5](/phases/s5-furni-catalogue.md) brings furni ([0059](/decisions/0059-a-deleted-rooms-furni-goes-to-its-owner.md)).
- [x] Tests with the Go test client: each change, a habbo that is not the owner, and a deleted room gone from the lists
  and the favourites.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- `GETFLATINFO` (21) gets 54: whether others move furniture, the door as 0, 1 or 2, the id, the owner, `-` when the
  room hides it from the viewer, `model_<model>` as the marker, the name, the description, whether to show the owner,
  the category's trading flag, 0 for the alert, which no script reads, the most visitors, and 25 as the absolute most,
  which caps the modify page's + button where Holo left the client's 50. Holo's check of the hidden owner was inverted;
  this one hides it from everyone but the owner and holders of `fuse_see_all_roomowners`.
- `GETFLATCAT` (152) gets 222 with the owner's room and its category; another habbo's room gets no answer.
- `UPDATEFLAT` (24) changes the name, the door and whether to show the owner, by `CREATEFLAT`'s rules
  ([0056](/decisions/0056-own-rooms-follow-holos-rules.md)); `SETFLATINFO` and `SETFLATCAT` came with
  [s3-06](/tasks/s3-06-creating-a-room.md). Only the owner changes a room.
- `DELETEFLAT` (23) deletes the owner's room with the favourites that name it; its furni goes to the owner's hand once
  S5 brings furni ([0059](/decisions/0059-a-deleted-rooms-furni-goes-to-its-owner.md)).
- `game.RoomInfo`, `game.RoomCategoryOf`, `game.UpdateRoom` and `game.DeleteRoom` carry the rules.
- `go test ./... -race` passes in `packages/server`, with `TestARoomsInfo`, `TestTheOwnerChangesARoom` and
  `TestDeletingARoom`.
- The README of `packages/server` describes them.

# Notes

- Runs on the branch `s3-changing-a-room`.
- `REMOVEALLRIGHTS` (155) waits for the rights of [S4](/phases/s4-rooms.md).
