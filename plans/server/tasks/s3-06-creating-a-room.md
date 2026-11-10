---
type: Task
title: Create a room with the room-o-matic
description: CREATEFLAT creates a habbo's room, up to 50, with a club model only for club fuses; SETFLATCAT puts it in a category the habbo's level allows, and SETFLATINFO saves its description, hashed password, furniture rights and visitors.
status: todo
phase: s3
depends_on: [s3-02]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_kiosk_room/3_RoomKiosk Interface Class.ls", "packages/client-r26/src/game/hh_kiosk_room/4_RoomKiosk Component Class.ls"]
timestamp: 2026-11-10T03:40:35+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
---

# Goal

A habbo creates a room with the room-o-matic ([hh_kiosk_room](/reference/r26/hh_kiosk_room.md), Creating a room), by
the rules of [0056](/decisions/0056-own-rooms-follow-holos-rules.md).

# Steps

- [ ] `CREATEFLAT` (29) creates the room, the habbo its creator and its owner: a name of 1 to 50 characters, a model of
  the habbo rooms, a club model only for holders of `fuse_use_special_room_layouts`, the door and whether to show the
  owner; up to `game.maxRoomsPerHabbo`. It answers 59 with the room's id and name, or 33
  `Error creating a private room`.
- [ ] `SETFLATCAT` (153) puts the owner's room in a category of habbo rooms that the owner's level allows.
- [ ] `SETFLATINFO` (25), the kiosk's form: the description, up to 125 characters as Holo's column held; the password,
  1 to 32 characters, stored hashed ([0062](/decisions/0062-room-passwords-are-hashed.md)); whether others may move
  furniture; and the most visitors, 10 to 25.
- [ ] Tests with the Go test client: a room created and set up; the limit; a club model without the fuse; a category
  above the habbo's level; a name too long.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s3-creating-a-room`.
