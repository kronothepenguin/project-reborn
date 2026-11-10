---
type: Task
title: Queue for full rooms and watch as a spectator
description: A full room queues its arriving habbos and takes spectators, as the R26 client shows them, in memory.
status: done
phase: s4
depends_on: [s4-03]
packages: [packages/server, packages/virtual]
client: []
timestamp: 2026-11-10T21:06:15+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T19:40:12+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T21:06:15+00:00"}
---

# Goal

Full rooms queue habbos and take spectators ([0080](/decisions/0080-full-rooms-queue-and-take-spectators-in-s4.md)).

# Steps

- [x] The queue's details are asked and settled: every room queues
  ([0087](/decisions/0087-every-full-room-queues.md)), club members first
  ([0088](/decisions/0088-club-members-first-in-a-queue.md)), up to 50 spectators from the queue
  ([0089](/decisions/0089-up-to-50-spectators-from-the-queue.md)), and the sets `room` and `spectators`
  ([0090](/decisions/0090-queue-sets-room-and-spectators.md)).
- [x] 259 and `ROOM_QUEUE_CHANGE` (211) for the queue; 254, 283, 298 and `GET_SPECTATOR_AMOUNT` (216) for the
  spectators, in memory ([0069](/decisions/0069-doorbell-queue-and-spectators-in-memory.md)).
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- The user settled the queue's details: every full room queues
  ([0087](/decisions/0087-every-full-room-queues.md)), club members first
  ([0088](/decisions/0088-club-members-first-in-a-queue.md)), up to 50 spectators from the queue
  ([0089](/decisions/0089-up-to-50-spectators-from-the-queue.md)), and the sets `room` and `spectators`
  ([0090](/decisions/0090-queue-sets-room-and-spectators.md)).
- A full room, as `#room_directory`, `TRYFLAT` or a `G_STAT` that comes too late finds it, puts the habbo in its queue,
  heading for it, with its club status, and everyone waiting gets 259: two sets, its own first, each with a `club`
  queue and one of the set's own name, and how many of each come in before it; a club member has nobody but club
  members ahead. The texts that show them come with the client's files (`plans/client`).
- A place that frees, as a habbo leaves or the owner raises the room's limit, lets the next habbo in, the first club
  member first: it gets 69 or 41 and goes on as from the door, its place kept in the room (`Reserve`) until it comes
  in, so that a newcomer cannot take it, and full rooms count kept places as taken. A habbo that goes elsewhere frees
  its place or its line.
- `ROOM_QUEUE_CHANGE` (211) moves a habbo between the room's line and the spectators'; a free seat lets the spectators'
  queue in with 254 first, up to `game.maxSpectators`, 50. A spectator builds the room, gets the statuses alone at
  `G_STAT` and takes no place; it sees the room's events, its comings and goings, statuses, chats and shouts, but no
  whisper; `GET_SPECTATOR_AMOUNT` (216) answers 298. When the room empties, its spectators get 283 and 18, and those
  still in its queues are let in; a deleted room sends its lines out with 18 first.
- The loaded room keeps its limit, which `SetRoomSettings` changes, and a fourth line, `SpectatorQueue`.
- 224 with 1 is no longer sent: `TestABannedHabboAndAFullRoom` now expects 259.
- In `packages/server`, `go vet ./...` and `go test ./... -race` pass, with `TestAFullRoomQueuesAndTakesSpectators` and
  `TestClubMembersComeFirstInAQueue`; `packages/virtual` and housekeeping's settings tests pass.

# Notes

- Runs on the branch `s4-queue-and-spectators`.
- Split from [s4-07](/tasks/s4-07-room-extras.md).
