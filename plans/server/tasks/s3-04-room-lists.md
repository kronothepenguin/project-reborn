---
type: Task
title: List own rooms, search results and recommended rooms
description: SUSERF gets the habbo's own rooms, SRCHF the rooms whose name or owner matches, at most 30, and GET_RECOMMENDED_ROOMS three random habbo rooms.
status: done
phase: s3
depends_on: [s3-02]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_navigator/5_Navigator Component Class.ls", "packages/client-r26/src/game/hh_navigator/6_Navigator Handler Class.ls"]
timestamp: 2026-11-10T11:50:27+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T11:50:27+00:00"}
---

# Goal

The navigator's own rooms, search and recommended rooms ([hh_navigator](/reference/r26/hh_navigator.md)).

# Steps

- [x] `SUSERF` (16) gets 16 with the habbo's rooms, as lines of text, or 57 when it has none.
- [x] `SRCHF` (17) gets 55 with the habbo rooms whose name holds the query or whose owner is named by it, at most
  `game.searchMaxRooms` ([0061](/decisions/0061-navigator-lists-show-up-to-30-rooms.md)), or 58 when none matches.
- [x] `GET_RECOMMENDED_ROOMS` (264) gets 351 with three random habbo rooms
  ([0057](/decisions/0057-three-random-recommended-rooms.md)).
- [x] A room that hides its owner shows no owner, except to holders of `fuse_see_all_roomowners`, as in
  [s3-03](/tasks/s3-03-browsing.md).
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- `SUSERF` (16) gets 16 with the habbo's rooms as lines of text, or 57 when it has none; the session's habbo is the one
  listed, whatever name the client sends.
- `SRCHF` (17) gets 55 with the rooms whose name holds the query or whose owner it names, at most `game.searchMaxRooms`
  ([0061](/decisions/0061-navigator-lists-show-up-to-30-rooms.md)), or 58 when none matches or the query is empty.
- `GET_RECOMMENDED_ROOMS` (264) gets 351 with three habbo rooms drawn at random
  ([0057](/decisions/0057-three-random-recommended-rooms.md)).
- A room that hides its owner shows `-`, and, unlike Holo's search, a search for the owner's name never finds it,
  except for the owner and for holders of `fuse_see_all_roomowners`: the store's `SearchRooms` takes the viewer.
- 16 and 55 carry a room per line, nine items separated by tabs, with `x` for the port and `null` for the filter as Holo
  wrote them; control characters in a name or a description become spaces.
- `go test ./... -race` passes in `packages/server`, with `TestAHabbosOwnRooms`, `TestSearchingRooms` and
  `TestThreeRecommendedRooms`; in `packages/store`, `go test ./...` passes with `TestASearchNeverGivesAHiddenOwnerAway`,
  `make check-docs` exits 0 and regenerating leaves the generated files unchanged.
- The README of `packages/server` describes them.

# Notes

- Runs on the branch `s3-room-lists`.
