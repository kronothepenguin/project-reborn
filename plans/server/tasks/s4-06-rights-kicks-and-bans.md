---
type: Task
title: Give rights, kick and ban
description: An owner gives and takes rights, all at once too, and kicks and bans habbos for 15 minutes; holders of fuse_any_room_controller act as owners.
status: done
phase: s4
depends_on: [s4-03]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-10T18:30:15+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T18:30:15+00:00"}
---

# Goal

A room's owner controls who may do what in it ([hh_room](/reference/r26/hh_room.md)).

# Steps

- [x] `ASSIGNRIGHTS` (96) and `REMOVERIGHTS` (97) give and take a habbo's rights in the owner's room, saved, and the
  habbo gets 42 or 43; `REMOVEALLRIGHTS` (155, hh_navigator's) takes them all.
- [x] `KICKUSER` (95) takes a habbo out of the room; `BANUSER` (320) also keeps it out for `game.roomBanMinutes`
  ([0067](/decisions/0067-a-room-ban-lasts-15-minutes.md)).
- [x] Holders of `fuse_any_room_controller` act as owners in every room, and nobody kicks or bans an owner or a holder
  ([0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md)).
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- Who may do what follows the client's Room Object Window Creator, which shows Kick to the owner, the holders of
  `fuse_any_room_controller` and the habbos with rights, Ban only to the first two, and the rights buttons only to the
  owner, never in a public room. The rules check the same, and nobody kicks or bans an owner or a holder of
  `fuse_any_room_controller` ([0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md)).
- `ASSIGNRIGHTS` (96) and `REMOVERIGHTS` (97) save the change, then the room's copy, and the habbo gets 42 or 43 and
  its status gains or loses `flatctrl`. `REMOVEALLRIGHTS` (155), from the navigator's modify page of the habbo's own
  room, takes every right; those in the room get 43. Holo had no handler for it.
- A habbo with rights shows `flatctrl` with no level, which the client's Human class reads as `furniture`, the level its
  rights buttons compare; s4-03 had copied Holo's `onlyfurniture`, another client's, which left the owner's Give
  rights button on a habbo that had them.
- `KICKUSER` (95) and `BANUSER` (320) send the habbo walking to the door, a step every 500 ms, with `Leaving` set so
  that `MOVE` changes nothing, and the room's clock sends it 18 and takes it out once it stops, at the door or with no
  way to it ([0079](/decisions/0079-a-kicked-habbo-walks-out.md)). A habbo standing on the door blocks its tile, as
  any habbo's tile blocks the way, and the kicked habbo then leaves at once. A ban is saved for `game.roomBanMinutes`,
  in the room's copy too ([0067](/decisions/0067-a-room-ban-lasts-15-minutes.md)), and the next `TRYFLAT` gets 224 with
  4.
- In `packages/server`, `go vet ./...` and `go test ./... -race` pass, with `TestRightsKicksAndBans`, three times in
  separate runs: rights given, saved and taken, a kick by a habbo with rights that walks the trespasser 4 tiles out, no
  kick of the owner and no ban by a habbo with rights, the owner's ban and its 224 with 4, and `REMOVEALLRIGHTS`.

# Notes

- Runs on the branch `s4-rights-kicks-and-bans`.
