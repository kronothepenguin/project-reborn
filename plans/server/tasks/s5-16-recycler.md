---
type: Task
title: Recycle furni
description: The recycler takes furni from the hand, keeps it saved while the recycling runs, and gives a reward for it or the furni back; its rewards and times start as Holo's.
status: todo
phase: s5
depends_on: [s5-03, s5-04]
packages: [packages/store, packages/virtual, packages/server]
client: ["packages/client-r26/src/game/hh_recycler/4_Recycler Component Class.ls", "packages/client-r26/src/game/hh_recycler/5_Recycler Handler Class.ls", "packages/client-r26/src/game/hh_cat_code/14_Catalogue recycler Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

A habbo recycles furni for a reward ([0093](/decisions/0093-a-recycling-is-saved.md),
[hh_recycler](/reference/r26/hh_recycler.md)).

# Steps

- [ ] Tables for the recycler's rewards, seeded with Holo's four, a Palm Chair for 20 furni, a Water Garden for 30, a
  Polar Sofa for 40 and a Moon Lamp for 50, and for each habbo's recycling; settings for the recycler being on, the
  minimum owned time, the recycling's length and its time-out, in Holo 30 days, 60 minutes and 7 days; an update,
  queries, tests and the OKF concepts, with the `adding-data-persistence` skill.
- [ ] `GET_FURNI_RECYCLER_CONFIGURATION` (222) answers 303, and `GET_FURNI_RECYCLER_STATUS` (223) answers 304 with the
  habbo's recycling.
- [ ] `START_FURNI_RECYCLING` (225) moves the furni named from the hand into the recycler, 306;
  `CONFIRM_FURNI_RECYCLING` (226) gives the reward and destroys them once the recycling is over, or gives them back, 307
  ([0093](/decisions/0093-a-recycling-is-saved.md)).
- [ ] Tests with the Go test client, a recycling that outlives a restart among them.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-recycler`.
- To settle before it starts:
  - What a time-out does; Holo's check destroyed the furni and gave nothing.
  - Whether the minimum owned time is checked, and from when a furni counts as owned; Holo sent it to the client and
    never checked it.
  - Whether a habbo must be in a room to recycle, as Holo asked.
