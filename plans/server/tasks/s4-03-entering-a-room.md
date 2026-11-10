---
type: Task
title: Enter and leave a room
description: A habbo enters a public room or a habbo room past its door, its password, its ban or its doorbell, gets the room's map, habbos, objects and statuses, and leaves; the loading ad and the room ad come from settings.
status: todo
phase: s4
depends_on: [s4-02]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-10T16:42:08+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
---

# Goal

A habbo enters and leaves rooms ([hh_room](/reference/r26/hh_room.md), Entering a room).

# Steps

- [ ] `#room_directory` (2) enters a public room by its port, or goes on with 19 in a habbo room; `TRYFLAT` (57)
  answers by the door: 41 for an open one; 91 for a closed one, while those with rights get 91 with the name and answer
  with `LETUSERIN` (98), 41 or 131; a password compared with the hash
  ([0062](/decisions/0062-room-passwords-are-hashed.md)), or 33 `Incorrect flat password`. A banned habbo gets 224 with
  4, a full room 224 with 1. `GOTOFLAT` (59) brings 69 with the model, and 42, 43 and 47 for the habbo's rights.
- [ ] `G_HMAP` (31), `G_USRS` (28), `G_OBJS` (30, a public room's furni), `G_ITEMS` (45) and the furniture (32), none
  until S5, and `G_STAT` (34); the room's habbos get the newcomer in 28 and 34.
- [ ] `QUIT` (53), a closed session, or another room's entry takes the habbo out, and the others get 29.
- [ ] `GETINTERST` (182) gets 258 and `GETROOMAD` (126) 208 from the settings
  ([0070](/decisions/0070-a-loading-ad-and-a-room-ad-from-settings.md)).
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s4-entering-a-room`.
