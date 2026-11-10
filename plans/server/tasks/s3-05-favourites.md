---
type: Task
title: Keep a habbo's favourite rooms
description: GETFVRF gets the habbo's favourite public rooms and habbo rooms, ADD_FAVORITE_ROOM saves one, up to 30, and DEL_FAVORITE_ROOM removes one.
status: todo
phase: s3
depends_on: [s3-02]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_navigator/5_Navigator Component Class.ls", "packages/client-r26/src/game/hh_navigator/6_Navigator Handler Class.ls"]
timestamp: 2026-11-10T03:40:35+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
---

# Goal

A habbo's favourite rooms are saved, up to 30 ([0058](/decisions/0058-favourites-saved-up-to-30.md)).

# Steps

- [ ] `GETFVRF` (18) gets 61 with the habbo's favourite public rooms and habbo rooms.
- [ ] `ADD_FAVORITE_ROOM` (19) saves a public room or a habbo room that exists; past `game.maxFavouriteRooms` it gets 33
  `Only 10 favorite rooms allowed!`.
- [ ] `DEL_FAVORITE_ROOM` (20) removes one.
- [ ] Tests with the Go test client: the list, adding, the limit and removing.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s3-favourites`.
