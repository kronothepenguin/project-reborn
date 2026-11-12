---
type: Task
title: Recycle furni
description: The recycler takes furni from the hand, keeps it saved while the recycling runs, and gives a reward for it or the furni back; its rewards and times start as Holo's.
status: done
phase: s5
depends_on: [s5-03, s5-04]
packages: [packages/store, packages/virtual, packages/server]
client: ["packages/client-r26/src/game/hh_recycler/4_Recycler Component Class.ls", "packages/client-r26/src/game/hh_recycler/5_Recycler Handler Class.ls", "packages/client-r26/src/game/hh_cat_code/14_Catalogue recycler Class.ls"]
timestamp: 2026-11-12T01:17:50+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-12T01:17:50+00:00"}
---

# Goal

A habbo recycles furni for a reward ([0093](/decisions/0093-a-recycling-is-saved.md),
[hh_recycler](/reference/r26/hh_recycler.md)).

# Steps

- [x] Tables for the recycler's rewards, seeded with Holo's four, a Palm Chair for 20 furni, a Water Garden for 30, a
  Polar Sofa for 40 and a Moon Lamp for 50, and for each habbo's recycling; settings for the recycler being on, the
  minimum owned time, the recycling's length and its time-out, in Holo 30 days, 60 minutes and 7 days; an update,
  queries, tests and the OKF concepts, with the `adding-data-persistence` skill.
- [x] `GET_FURNI_RECYCLER_CONFIGURATION` (222) answers 303, and `GET_FURNI_RECYCLER_STATUS` (223) answers 304 with the
  habbo's recycling.
- [x] `START_FURNI_RECYCLING` (225) moves the furni named from the hand into the recycler, 306;
  `CONFIRM_FURNI_RECYCLING` (226) gives the reward and destroys them once the recycling is over, or gives them back, 307
  ([0093](/decisions/0093-a-recycling-is-saved.md)).
- [x] Tests with the Go test client, a recycling that outlives a restart among them.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

Results:

- The store gains `recycler_rewards`, seeded with Holo's four, and `recyclings`, a habbo's recycling with its start and
  its reward, and `furni.recycler_avatar_id`, the habbo whose recycler a piece waits in, with the update
  `0020-recycler.sql` and the query file `recycler.query.sql`. Four settings: `recycler.enabled`,
  `recycler.minOwnedMinutes` 43200, `recycler.sessionMinutes` 60 and `recycler.timeoutMinutes` 10080, the last longer
  than the third.
- `GET_FURNI_RECYCLER_CONFIGURATION` (222) answers 303 and `GET_FURNI_RECYCLER_STATUS` (223) answers 304, the state
  counted from the saved start: nothing of a recycling lives in memory, so a restart changes nothing
  ([0093](/decisions/0093-a-recycling-is-saved.md)).
- `START_FURNI_RECYCLING` (225) moves the furni from the hand into the recycler in one transaction, for a habbo in a
  room ([0118](/decisions/0118-a-recycling-starts-in-a-room.md)), when a reward takes exactly that many and each furni
  is recyclable, on offer in no trade and old enough ([0117](/decisions/0117-the-recycler-checks-a-furnis-age.md)); 306
  tells.
- `CONFIRM_FURNI_RECYCLING` (226) takes a ready reward, which destroys the furni given, or refuses it, which gives them
  back; a reward that is not ready or waited too long is not taken
  ([0116](/decisions/0116-a-recycling-that-waits-too-long-gives-the-furni-back.md)); 307 tells.
- In `packages/store`, `go vet ./...`, `go test ./...` and `make check-docs` pass. In `packages/server`,
  `go test ./... -race` passes, with `TestRecycling`, which moves the saved start back to pass the hour and the 7 days.
  `make gates` passes.

# Notes

- Runs on the branch `s5-recycler`.
- Settled before it started: a recycling that waits too long gives the furni back
  ([0116](/decisions/0116-a-recycling-that-waits-too-long-gives-the-furni-back.md)), a furni's age is checked from when
  it was made ([0117](/decisions/0117-the-recycler-checks-a-furnis-age.md)), and a recycling starts only in a room
  ([0118](/decisions/0118-a-recycling-starts-in-a-room.md)).
- Chosen without asking: the settings are `recycler.enabled`, `recycler.minOwnedMinutes`, `recycler.sessionMinutes` and
  `recycler.timeoutMinutes`, in Holo's minutes, 43200, 60 and 10080, and the time-out counts from the recycling's start,
  as Holo's did; a recycling is a habbo's, as its hand is; the furni given wait in `furni` under `recycler_avatar_id`;
  306 and 307 answer 1 or 0, where Holo answered with the status; the reward is taken or refused whether the recycler is
  on or off, so that turning it off strands nothing; only a recyclable furni is taken, which Holo never checked.
