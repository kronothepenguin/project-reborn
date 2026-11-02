---
type: Task
title: Refresh the CMS settings on schedule
description: A CMS running alone re-reads the settings every cms.refresh seconds, on the scheduler.
status: todo
phase: fx
depends_on: []
packages: [packages/scheduler, packages/virtual, packages/cms, packages/housekeeping]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

A change in housekeeping reaches a running CMS without a restart, within `cms.refresh` seconds.

# Steps

- [ ] `scheduler.Second`, and the refresh task in `cms.New`.
- [ ] A failed read keeps the current values and logs the error.
- [ ] `cms.refresh` gets a form and leaves `hiddenSettings`.
- [ ] Prove it with a running CMS and housekeeping: maintenance on, and off.
- [ ] Update `plans/holo-port/reference/architecture.md` and `reference/holo-differences.md`.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

# Notes

- None yet.
