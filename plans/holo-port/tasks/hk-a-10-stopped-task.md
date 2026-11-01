---
type: Task
title: Keep a stopped task from running
description: After stop, a tick that waited out a slow run started another run, because select picks at random.
status: done
phase: hk-a
depends_on: [hk-a-09]
packages: [packages/scheduler]
holo: []
timestamp: 2026-11-01T22:52:09+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T22:52:09+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T22:52:09+00:00"}
---

# Goal

A task that was stopped never starts another run, as the documentation of `scheduler.Every` promises.

# Steps

- [x] A test that stops a task while a tick is pending, repeated because `select` hides the bug half of the time.
- [x] Check the context after the tick.

# Verification

```sh
cd packages/scheduler && gofmt -l . && go vet ./... && go test ./... -race -count=20
go test . -run TestATaskNeverOverlapsItself -count=5000
```

Results (2026-11-01T22:52:09+00:00):

- `TestAPendingTickDoesNotOutliveStop` failed before the fix, with `2 runs, want only the one under way at the stop`, and
  passes after it.
- `TestATaskNeverOverlapsItself`, which failed about one time in a hundred, passed 5000 times in a row.
- `gofmt`, `go vet` and 20 passes of `go test -race` pass in `packages/scheduler`.

# Notes

- The agent of HK-A found it through that flaky test. The harm was small: `DeleteExpiredSessions` and `DeleteExpiredResets`
  are the only tasks, and nothing stops them in a running program.
