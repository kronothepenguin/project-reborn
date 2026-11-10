---
type: Task
title: Rate rooms, hold events, and show groups and tags
description: RATEFLAT rates a room, room events list and run, a habbo's favourite group shows, and tags list.
status: done
phase: s4
depends_on: [s4-03]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-10T19:48:50+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T19:48:50+00:00"}
---

# Goal

The rest of `hh_room`'s room life ([hh_room](/reference/r26/hh_room.md)).

# Steps

- [x] `RATEFLAT` (261) records a habbo's vote, once, and the room gets 345
  ([0082](/decisions/0082-a-rating-is-the-sum-and-the-share-of-up-votes.md)), which `GOTOFLAT` sends too.
- [x] Room events: `CAN_CREATE_ROOMEVENT` (345), `CREATE_ROOMEVENT` (346), `QUIT_ROOMEVENT` (347), `EDIT_ROOMEVENT`
  (348), `GET_ROOMEVENT_TYPE_COUNT` (349) and `GET_ROOMEVENTS_BY_TYPE` (350), with 367 to 370, 11 types
  ([0081](/decisions/0081-eleven-room-event-types.md)); events live only in memory
  ([0011](/decisions/0011-saved-and-memory-only-data.md)).
- [x] `GET_GROUP_BADGES` (230) gets 309 and `GET_GROUP_DETAILS` (231) 311, from the habbos' favourite groups
  ([0068](/decisions/0068-a-habbo-shows-its-favourite-groups-badge.md)), and the user lines name each habbo's group
  and its status in it.
- [x] `GET_USER_TAGS` (263) gets 350 with a habbo's tags from the site.
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- The user settled the task's questions: full rooms queue and take spectators in S4, in
  [s4-12](/tasks/s4-12-queue-and-spectators.md) ([0080](/decisions/0080-full-rooms-queue-and-take-spectators-in-s4.md));
  11 event types, as Holo ([0081](/decisions/0081-eleven-room-event-types.md)); a rating of the sum and the share of +1
  ([0082](/decisions/0082-a-rating-is-the-sum-and-the-share-of-up-votes.md)); and five badge slots, in
  [s4-11](/tasks/s4-11-five-badge-slots.md) ([0083](/decisions/0083-a-habbo-wears-five-badges-in-slots.md)).
- `RATEFLAT` (261) saves a habbo's vote once, in a habbo room, and everyone in it who has voted gets 345: the sum,
  never below 0, and the share of +1 votes; a habbo that has not voted gets -1, which shows the vote buttons. Holo sent
  the new sum only when the voter was the owner; every vote sends it here. `GOTOFLAT` sends the rating and the room's
  event after the rights, as Holo did.
- Room events live in the loaded room: `CAN_CREATE_ROOMEVENT` (345) answers 367 for the room's owners, as `owns`
  counts them, Holo's `_isOwner`; `CREATE_ROOMEVENT` (346) and `EDIT_ROOMEVENT` (348) take a type 1 to
  `game.roomEventTypes` and a name and a description of 3 characters or more, as the client asks, with no longest,
  as Holo; the room gets 370; `QUIT_ROOMEVENT` (347) and the host leaving end it with 370 `-1`;
  `GET_ROOMEVENT_TYPE_COUNT` (349) answers 368 and `GET_ROOMEVENTS_BY_TYPE` (350) 369. The start is `HH:MM` in UTC,
  as Holo's short time.
- The online habbo keeps its favourite group from its login, which the user lines name, `g` and `t`, its status 1
  owner, 2 admin or 3 member, as the client's Group Info class reads them. `GET_GROUP_BADGES` (230) answers 309 and
  `GET_GROUP_DETAILS` (231) 311, with -1 for the room groups have not. A favourite changed on the site shows from the
  next login: the site cannot tell the server yet.
- `GET_USER_TAGS` (263) answers 350 with the tags of the habbo's profile.
- The setting `game.roomEventTypes`, 11, is in the catalogue and housekeeping's Game form.
- In `packages/server`, `go vet ./...` and `go test ./... -race` pass, with `TestRatingARoom`,
  `TestHostingARoomEvent` and `TestGroupsAndTags`; `packages/virtual` and housekeeping's settings tests pass.

# Notes

- `SETBADGE` (158) and 228 moved to [s4-11](/tasks/s4-11-five-badge-slots.md), and the queue and the spectators to
  [s4-12](/tasks/s4-12-queue-and-spectators.md), once the user answered how many badges a habbo wears and that S4
  builds the queue.

- Runs on the branch `s4-room-extras`.
