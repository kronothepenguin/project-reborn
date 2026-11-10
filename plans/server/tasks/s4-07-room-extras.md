---
type: Task
title: Rate rooms, hold events, show badges and tags, and queue
description: RATEFLAT rates a room, room events list and run, a habbo's badge and favourite group show, tags list, and full rooms queue their habbos and spectators.
status: todo
phase: s4
depends_on: [s4-03]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-10T16:42:08+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
---

# Goal

The rest of `hh_room`'s room life ([hh_room](/reference/r26/hh_room.md)).

# Steps

- [ ] `RATEFLAT` (261) records a habbo's vote, once, and the room gets 345.
- [ ] Room events: `CAN_CREATE_ROOMEVENT` (345), `CREATE_ROOMEVENT` (346), `QUIT_ROOMEVENT` (347), `EDIT_ROOMEVENT`
  (348), `GET_ROOMEVENT_TYPE_COUNT` (349) and `GET_ROOMEVENTS_BY_TYPE` (350), with 367 to 370; events live only in
  memory ([0011](/decisions/0011-saved-and-memory-only-data.md)). What the event types are is asked when the task
  starts.
- [ ] `GET_GROUP_BADGES` (230) gets 309 and `GET_GROUP_DETAILS` (231) 311, from the habbos' favourite groups
  ([0068](/decisions/0068-a-habbo-shows-its-favourite-groups-badge.md)); `SETBADGE` (158) and 228 show the worn badge.
- [ ] `GET_USER_TAGS` (263) gets 350 with a habbo's tags from the site.
- [ ] The queue and the spectators of a full room, `ROOM_QUEUE_CHANGE` (211), `GET_SPECTATOR_AMOUNT` (216), 254, 259,
  283 and 298, in memory ([0069](/decisions/0069-doorbell-queue-and-spectators-in-memory.md)).
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s4-room-extras`.
