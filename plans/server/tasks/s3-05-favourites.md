---
type: Task
title: Keep a habbo's favourite rooms
description: GETFVRF gets the habbo's favourite public rooms and habbo rooms, ADD_FAVORITE_ROOM saves one, up to 30, and DEL_FAVORITE_ROOM removes one.
status: done
phase: s3
depends_on: [s3-02]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_navigator/5_Navigator Component Class.ls", "packages/client-r26/src/game/hh_navigator/6_Navigator Handler Class.ls"]
timestamp: 2026-11-10T11:52:30+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T11:52:30+00:00"}
---

# Goal

A habbo's favourite rooms are saved, up to 30 ([0058](/decisions/0058-favourites-saved-up-to-30.md)).

# Steps

- [x] `GETFVRF` (18) gets 61 with the habbo's favourite public rooms and habbo rooms.
- [x] `ADD_FAVORITE_ROOM` (19) saves a public room or a habbo room that exists; past `game.maxFavouriteRooms` it gets 33
  `Only 10 favorite rooms allowed!`.
- [x] `DEL_FAVORITE_ROOM` (20) removes one.
- [x] Tests with the Go test client: the list, adding, the limit and removing.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- `GETFVRF` (18) gets 61: a header node of type 2 with the favourite habbo rooms as its flats, then the favourite public
  rooms as nodes of type 1, each under its category. Holo interleaved the two in its list, which the client cannot read;
  they come apart here, as 61's layout wants them.
- `ADD_FAVORITE_ROOM` (19) keeps a public room or a habbo room that exists, once; past `game.maxFavouriteRooms` it gets
  33 `Only 10 favorite rooms allowed!` ([0058](/decisions/0058-favourites-saved-up-to-30.md)). The count and the
  insert share a transaction. `DEL_FAVORITE_ROOM` (20) removes one.
- `game.Favourites`, `game.AddFavourite` and `game.RemoveFavourite` carry the rules; `NAVIGATE` and 61 share the writer
  of a public room's node.
- `go test ./... -race` passes in `packages/server`, with `TestKeepingFavouriteRooms` and
  `TestTheFavouritesHaveALimit`.
- The README of `packages/server` describes them.

# Notes

- Runs on the branch `s3-favourites`.
