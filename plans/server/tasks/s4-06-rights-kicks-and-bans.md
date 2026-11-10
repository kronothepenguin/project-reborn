---
type: Task
title: Give rights, kick and ban
description: An owner gives and takes rights, all at once too, and kicks and bans habbos for 15 minutes; holders of fuse_any_room_controller act as owners.
status: todo
phase: s4
depends_on: [s4-03]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-10T16:42:08+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
---

# Goal

A room's owner controls who may do what in it ([hh_room](/reference/r26/hh_room.md)).

# Steps

- [ ] `ASSIGNRIGHTS` (96) and `REMOVERIGHTS` (97) give and take a habbo's rights in the owner's room, saved, and the
  habbo gets 42 or 43; `REMOVEALLRIGHTS` (155, hh_navigator's) takes them all.
- [ ] `KICKUSER` (95) takes a habbo out of the room; `BANUSER` (320) also keeps it out for `game.roomBanMinutes`
  ([0067](/decisions/0067-a-room-ban-lasts-15-minutes.md)).
- [ ] Holders of `fuse_any_room_controller` act as owners in every room, and nobody kicks or bans an owner or a holder
  ([0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md)).
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s4-rights-kicks-and-bans`.
