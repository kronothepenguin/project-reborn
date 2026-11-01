---
type: Task
title: Build packages/scheduler
description: Add the package-level scheduler, whose tasks read scheduler.Every(1, scheduler.Hour, task).
status: done
phase: p0
depends_on: []
packages: [packages/scheduler]
holo: []
timestamp: 2026-11-01T19:55:26+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:50:41+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:55:26+00:00"}
---

# Goal

Implement [0043](/decisions/0043-scheduler.md).

# Steps

- [x] New module `packages/scheduler`, added to `go.work`.
- [x] `Every(n, unit, task)` with the units `Minute`, `Hour` and `Day`.
- [x] A run that fails or panics is logged and keeps its schedule, and a task never overlaps itself.
- [x] `Every` returns a function that stops the task.
- [x] Tests on fake time, with `testing/synctest`.
- [x] Docs: `packages/scheduler/README.md` and the root `README.md`.

# Verification

```sh
cd packages/scheduler && gofmt -l . && go vet ./... && go test ./... -race
```

Results (2026-11-01T19:55:26+00:00):

- `gofmt`, `go vet` and `go test -race -count=20` pass in `packages/scheduler`, on the fake clock of `testing/synctest`, so
  the tests use real hours and days without waiting.
- Mutation checks, from a passing baseline: each of these, applied on purpose, failed a test:
  - no recovery from a panic;
  - errors not logged;
  - runs overlapping;
  - a run that keeps going after `stop`;
  - `n` ignored;
  - `stop` ignored;
  - the first run at once instead of after one interval;
  - a day of 12 hours.

# Notes

- `go.work` gains the module. The other modules need no `require`, as with the other packages, because the workspace
  resolves them.
- `Every` takes a plain `time.Duration` as its unit, so the units are constants and no parser exists.
- Each task has its own goroutine and ticker. Nothing else is needed for one process to run every program's tasks.
- A task has no name: its error carries its own context, as `auth`'s errors do.
