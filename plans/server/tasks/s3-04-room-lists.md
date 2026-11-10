---
type: Task
title: List own rooms, search results and recommended rooms
description: SUSERF gets the habbo's own rooms, SRCHF the rooms whose name or owner matches, at most 30, and GET_RECOMMENDED_ROOMS three random habbo rooms.
status: todo
phase: s3
depends_on: [s3-02]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_navigator/5_Navigator Component Class.ls", "packages/client-r26/src/game/hh_navigator/6_Navigator Handler Class.ls"]
timestamp: 2026-11-10T03:40:35+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
---

# Goal

The navigator's own rooms, search and recommended rooms ([hh_navigator](/reference/r26/hh_navigator.md)).

# Steps

- [ ] `SUSERF` (16) gets 16 with the habbo's rooms, as lines of text, or 57 when it has none.
- [ ] `SRCHF` (17) gets 55 with the habbo rooms whose name holds the query or whose owner is named by it, at most
  `game.searchMaxRooms` ([0061](/decisions/0061-navigator-lists-show-up-to-30-rooms.md)), or 58 when none matches.
- [ ] `GET_RECOMMENDED_ROOMS` (264) gets 351 with three random habbo rooms
  ([0057](/decisions/0057-three-random-recommended-rooms.md)).
- [ ] A room that hides its owner shows no owner, except to holders of `fuse_see_all_roomowners`, as in
  [s3-03](/tasks/s3-03-browsing.md).
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s3-room-lists`.
