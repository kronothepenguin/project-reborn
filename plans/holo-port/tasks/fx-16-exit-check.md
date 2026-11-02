---
type: Task
title: Verify FX
description: Every exit criterion of FX holds from a clean checkout, in a real browser.
status: todo
phase: fx
depends_on: [fx-03, fx-04, fx-05, fx-06, fx-07, fx-08, fx-09, fx-10, fx-11, fx-12, fx-13, fx-14, fx-15]
packages: [packages/cms, packages/housekeeping, packages/installer]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

`main` holds every review decision, and they work together.

# Steps

- [ ] Run every gate and every browser suite from a clean checkout.
- [ ] Update `plans/holo-port/reference/holo-differences.md`.
- [ ] Close the phase.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

# Notes

- None yet.
