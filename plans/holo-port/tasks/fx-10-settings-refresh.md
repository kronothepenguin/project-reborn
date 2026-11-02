---
type: Task
title: Refresh the CMS settings on schedule
description: A CMS running alone re-reads the settings every cms.refresh seconds, on the scheduler.
status: done
phase: fx
depends_on: []
packages: [packages/scheduler, packages/virtual, packages/cms, packages/housekeeping]
holo: []
timestamp: 2026-11-02T02:28:10+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T02:28:10+00:00"}
---

# Goal

A change in housekeeping reaches a running CMS without a restart, within `cms.refresh` seconds.

# Steps

- [x] `scheduler.Second`, and the refresh task in `cms.New`.
- [x] A failed read keeps the current values and logs the error.
- [x] `cms.refresh` gets a form and leaves `hiddenSettings`.
- [x] Prove it with a running CMS and housekeeping: maintenance on, and off.
- [x] Update `plans/holo-port/reference/architecture.md` and `reference/holo-differences.md`.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

Results (2026-11-02T02:28:10+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/scheduler`, `packages/virtual`, `packages/cms` and `packages/housekeeping`.
- `make e2e` passed all 370 checks. In a real browser, with a CMS and housekeeping running, maintenance saved in housekeeping
  closed the running CMS and opening it again reopened it, with no restart, and the address and the birthday setting arrived the
  same way.
- Four breaks made on purpose were each caught: no refresh, a bad row logged on every read, a new reason not logged, and `Load`
  staying silent.

# Notes

- `merge` logged every bad row each time it ran, which at one read a second would have filled the log. It now reports a row once,
  and again if the reason changes.
- The refresh is one query a second per CMS. A failed read keeps the current values, and the scheduler logs it.
- A new `cms.refresh` value applies when the CMS restarts, and the form says so.
