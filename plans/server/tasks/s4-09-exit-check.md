---
type: Task
title: Check S4's exit criteria
description: From the merged work, check every exit criterion of S4 and close the phase.
status: done
phase: s4
depends_on: [s4-01, s4-02, s4-03, s4-04, s4-05, s4-06, s4-07, s4-08, s4-10, s4-11, s4-12]
packages: [packages/server, packages/store, packages/virtual, packages/housekeeping]
client: []
timestamp: 2026-11-10T21:45:50+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T21:45:50+00:00"}
---

# Goal

S4 meets its [exit criteria](/phases/s4-rooms.md#exit-criteria) on `main`.

# Steps

- [x] Every exit criterion of [S4](/phases/s4-rooms.md), checked one by one on the merged work.
- [x] `packages/server/README.md` and the reference describe what S4 added.
- [x] S4 is `done`; `/index.md` names the next phase.

# Verification

```sh
make install && make gates
cd packages/server && go test ./... -race -v
```

Results, on the merged work of s4-01 to s4-08 and s4-10 to s4-12 (`main` at `ddf86603`):

- "Go test clients enter a public room and a habbo room, see each other, walk a step every 500 ms around walls and
  heights without cutting corners, chat, whisper and shout, type, dance and wave, and leave": `TestHabbosLiveInRooms`,
  added here, takes two clients through the Welcome Lounge and a habbo room in one session: they see each other, one
  walks two steps 500 ms apart, they chat, whisper and shout, one types, dances and waves, and they leave. The ways
  around walls and heights, without corners, are `game`'s `TestAWayGoesAroundAWallWithoutCuttingItsCorner` and
  `TestAStepGoesUpOrDownAtMostOneHeight`; with `TestTwoHabbosMeetInAPublicRoom`, `TestHabbosWalkAStepEvery500Milliseconds`,
  `TestChatShoutsAndWhispers` and `TestDancingAndWaving`. Passes.
- "An owner's room asks for its password, rings its doorbell, queues the arrivals of a full room and refuses a banned
  habbo; the owner gives and takes rights, answers the doorbell, kicks, and bans for 15 minutes", which said "refuses a
  full room" until [0087](/decisions/0087-every-full-room-queues.md): `TestAnOwnerKeepsItsRoom`, added here, with
  `TestAPasswordDoor`, `TestTheDoorbell`, `TestRightsKicksAndBans`, `TestABannedHabboAndAFullRoom` and
  `TestAFullRoomQueuesAndTakesSpectators`. Passes.
- "A habbo rates a room, ignores another, holds a room event, and shows its badge and its favourite group's":
  `TestAHabbosLifeInARoom`, added here, with `TestRatingARoom`, `TestIgnoringAHabbo`, `TestHostingARoomEvent`,
  `TestGroupsAndTags` and `TestWearingFiveBadges`. Passes.
- "The chat is saved, staff read it in housekeeping, and lines older than 30 days go": `TestHabbosLiveInRooms` counts
  the saved lines and prunes them 31 days on; housekeeping's `TestChatLogsFindARoomOrAHabbo` and
  `TestChatLogsComeInPagesOfAHundred`; `game`'s `TestPruneChatKeepsThirtyDays`. Passes.
- "The loading ad and the room ad come from housekeeping's settings, and an empty room unloads at once":
  `TestHabbosLiveInRooms` and `TestTheAdsComeFromTheSettings`; housekeeping's `TestTheGameFormHoldsTheClientsSettings`.
  Passes.
- "Every gate passes": `make install` exits 0 and changes no tracked file; `make gates` exits 0, with 31 packages `ok`;
  `go test ./... -race -v` in `packages/server` passes its 137 tests.
- `packages/server/README.md` describes S4's commands, rules and tests, and [the architecture](/reference/architecture.md)
  what S4 added: the loaded rooms, the room's clock and the session's outbox.
- [S4](/phases/s4-rooms.md) is done. [S5](/phases/s5-furni-catalogue.md) is next, once its open questions are answered.

# Notes

- Runs on the branch `s4-exit-check`.
