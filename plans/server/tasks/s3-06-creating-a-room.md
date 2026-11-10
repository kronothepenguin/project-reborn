---
type: Task
title: Create a room with the room-o-matic
description: CREATEFLAT creates a habbo's room, up to 50, with a club model only for club fuses; SETFLATCAT puts it in a category the habbo's level allows, and SETFLATINFO saves its description, hashed password, furniture rights and visitors.
status: done
phase: s3
depends_on: [s3-02]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_kiosk_room/3_RoomKiosk Interface Class.ls", "packages/client-r26/src/game/hh_kiosk_room/4_RoomKiosk Component Class.ls"]
timestamp: 2026-11-10T11:55:36+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T11:55:36+00:00"}
---

# Goal

A habbo creates a room with the room-o-matic ([hh_kiosk_room](/reference/r26/hh_kiosk_room.md), Creating a room), by
the rules of [0056](/decisions/0056-own-rooms-follow-holos-rules.md).

# Steps

- [x] `CREATEFLAT` (29) creates the room, the habbo its creator and its owner: a name of 1 to 50 characters, a model of
  the habbo rooms, a club model only for holders of `fuse_use_special_room_layouts`, the door and whether to show the
  owner; up to `game.maxRoomsPerHabbo`. It answers 59 with the room's id and name, or 33
  `Error creating a private room`.
- [x] `SETFLATCAT` (153) puts the owner's room in a category of habbo rooms that the owner's level allows.
- [x] `SETFLATINFO` (25), the kiosk's form: the description, up to 125 characters as Holo's column held; the password,
  1 to 32 characters, stored hashed ([0062](/decisions/0062-room-passwords-are-hashed.md)); whether others may move
  furniture; and the most visitors, 10 to 25.
- [x] Tests with the Go test client: a room created and set up; the limit; a club model without the fuse; a category
  above the habbo's level; a name too long.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- `CREATEFLAT` (29), in the new `r26/kiosk_room.go`, creates the room the habbo creates and owns, by the rules of
  [0056](/decisions/0056-own-rooms-follow-holos-rules.md): up to `game.maxRoomsPerHabbo`, counted in the transaction
  that creates it; a name of 1 to 50 characters without control characters; a model habbos build on, a club one only
  with `fuse_use_special_room_layouts`; and one of the client's three doors. It answers 59 with the id and the name on
  two lines, or 33 `Error creating a private room`. A new room sits in No category, the seed's id 2, until the
  room-o-matic's `SETFLATCAT`, which follows at once.
- `SETFLATCAT` (153) puts the owner's room in a category its level lets it use.
- `SETFLATINFO` (25) reads both forms, the navigator's `<id>/` and the room-o-matic's `/<id>/`, and changes the
  owner's room: the description, without control characters and cut at 125 characters, the size of Holo's column; a
  password of 1 to 32 characters, hashed with `auth.HashPassword` before the transaction
  ([0062](/decisions/0062-room-passwords-are-hashed.md)); whether others move furniture; and 10 to 25 visitors. A field
  the rules refuse leaves the whole change undone, and so does a room of another habbo.
- `game.CreateRoom`, `game.SetRoomCategory` and `game.SetRoomSettings` carry the rules.
- `go test ./... -race` passes in `packages/server`, with `TestCreatingARoomWithTheRoomOMatic`, `TestTheRoomLimit`,
  `TestAClubModelNeedsTheClubFuse`, `TestTheRoomOMaticRefusesWhatTheRulesRefuse` and
  `TestRoomSettingsOutsideTheRulesChangeNothing`.
- The README of `packages/server` describes them.

# Notes

- Runs on the branch `s3-creating-a-room`.
