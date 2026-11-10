---
type: Task
title: Walk
description: MOVE walks a habbo to a tile a step every 500 ms by Holo's rules, LOOKTO turns it, and every room's habbos see the steps in 34.
status: done
phase: s4
depends_on: [s4-03]
packages: [packages/server, packages/virtual]
client: ["packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-10T17:47:24+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T17:47:24+00:00"}
---

# Goal

Habbos walk ([0065](/decisions/0065-walking-500-ms-by-holos-rules.md)).

# Steps

- [x] `MOVE` (75) walks the habbo to a tile, a step every 500 ms, along a path in 8 directions, a diagonal only when both
  tiles beside it are free, up or down at most 1 height, around blocked tiles and other habbos.
- [x] `LOOKTO` (79) turns the habbo to a tile.
- [x] Each step goes to the room's habbos as a status line in 34, with `mv` to the next tile.
- [x] Tests: a path around a wall, no corner cut, a step too high refused, two habbos and the timing.

# Verification

```sh
cd packages/server && go test ./... -race
cd packages/virtual && go test ./... -race
make gates
```

Results:

- Each loaded room runs a clock, a goroutine `EnterRoom` starts when its entry loads the room and that ends with the
  room's `Done()` ([0072](/decisions/0072-each-loaded-room-runs-its-own-clock.md)). Every 500 ms
  ([0065](/decisions/0065-walking-500-ms-by-holos-rules.md)), `room.Tick` runs the step on every habbo at once under
  the room's lock, each walking habbo takes a step, and the statuses that changed go to everyone in the room in one 34
  (`game.Statuses`).
- As Holo's status cycle did, a step's status stands where the habbo was, with `mv <x>,<y>,<height>` to the tile it
  steps to, which the client animates, then the habbo moves there; at its goal, or with no way to it, it stops and its
  status goes without `mv`. The next step is found again on every tick, so habbos that move are walked around.
- The way is the shortest by A*, each step costing the same 500 ms, straight or diagonal: 8 directions; a diagonal only
  when both tiles beside it are open and free, where Holo's pathfinder checked the wrong side tile for one diagonal and
  added no cost per step, which made it greedy; up or down at most 1 height; never onto another habbo's tile; ties
  broken towards the straight line. A seat takes a habbo only as its goal, and seats it facing the seat's way with
  `sit 1`, dropping its dance, as Holo did; stepping off removes `sit` and `lay`.
- `MOVE` (75) sets the habbo's goal from two B64 shorts; a tile off the floor changes nothing. `LOOKTO` (79) turns the
  habbo, head and body, as Holo's `Rotation.Calculate` did, unless it sits or lies; its status goes out on the next
  tick, as Holo's `Refresh` did.
- `room.Occupant` holds the walk, `Walking`, `GoalX` and `GoalY`, and `Changed`.
- In `packages/server`, `go vet ./...` and `go test ./... -race` pass, with `TestHabbosWalkAStepEvery500Milliseconds`,
  three times in separate runs: 4 steps and the stop in 2 to 2.5 s, about 500 ms apart, a tick that carries both
  walking habbos, and a turn; and `game`'s `TestAWayGoesAroundAWallWithoutCuttingItsCorner`,
  `TestAStepGoesUpOrDownAtMostOneHeight`, `TestHabbosWalkAroundEachOther`, `TestAHabboSitsOnTheSeatItWalksTo`,
  `TestAStepSendsWhereTheHabboStandsAndWhereItGoes` and `TestDirectionsCountClockwiseFromNorth`. `packages/virtual`
  passes with `TestTickChangesEveryHabboAtOnce`.

# Notes

- Runs on the branch `s4-walking`.
