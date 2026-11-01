---
type: Task
title: Build packages/scheduler
description: Add the package-level scheduler, whose tasks read scheduler.Every(1, scheduler.Hour, task).
status: todo
phase: p0
depends_on: []
packages: [packages/scheduler]
holo: []
timestamp: 2026-11-01T19:50:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:50:41+00:00"}
---

# Goal

Implement [0043](/decisions/0043-scheduler.md).

# Steps

- [ ] New module `packages/scheduler`, added to `go.work`.
- [ ] `Every(n, unit, task)` with the units `Minute`, `Hour` and `Day`.
- [ ] A run that fails or panics is logged and keeps its schedule, and a task never overlaps itself.
- [ ] `Every` returns a function that stops the task.
- [ ] Tests on fake time, with `testing/synctest`.
- [ ] Docs: `packages/scheduler/README.md` and the root `README.md`.

# Verification

```sh
cd packages/scheduler && gofmt -l . && go vet ./... && go test ./... -race
```

# Notes

- None yet.
