---
type: Task
title: Read, change and delete a room
description: GETFLATINFO and GETFLATCAT read a room's settings and category; UPDATEFLAT, SETFLATINFO and SETFLATCAT let its owner change them, and DELETEFLAT deletes it.
status: todo
phase: s3
depends_on: [s3-06]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_navigator/5_Navigator Component Class.ls", "packages/client-r26/src/game/hh_navigator/6_Navigator Handler Class.ls"]
timestamp: 2026-11-10T03:40:35+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
---

# Goal

A room's owner reads and changes its settings, and deletes it ([hh_navigator](/reference/r26/hh_navigator.md), Changing
a room).

# Steps

- [ ] `GETFLATINFO` (21) gets 54 with the room's settings; a room that hides its owner shows none, as in
  [s3-03](/tasks/s3-03-browsing.md).
- [ ] `GETFLATCAT` (152) gets 222 with the room's category.
- [ ] `UPDATEFLAT` (24) changes the name, the door and whether to show the owner; `SETFLATINFO` (25), the navigator's
  form, and `SETFLATCAT` (153) as in [s3-06](/tasks/s3-06-creating-a-room.md). Only the owner may, by the rules of
  [0056](/decisions/0056-own-rooms-follow-holos-rules.md).
- [ ] `DELETEFLAT` (23) lets the owner delete the room, with the favourites that name it. Its furni goes to the owner's
  hand once [S5](/phases/s5-furni-catalogue.md) brings furni ([0059](/decisions/0059-a-deleted-rooms-furni-goes-to-its-owner.md)).
- [ ] Tests with the Go test client: each change, a habbo that is not the owner, and a deleted room gone from the lists
  and the favourites.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s3-changing-a-room`.
- `REMOVEALLRIGHTS` (155) waits for the rights of [S4](/phases/s4-rooms.md).
