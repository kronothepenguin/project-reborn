---
type: Task
title: Verify FX
description: Every exit criterion of FX holds from a clean checkout, in a real browser.
status: done
phase: fx
depends_on: [fx-03, fx-04, fx-05, fx-06, fx-07, fx-08, fx-09, fx-10, fx-11, fx-12, fx-13, fx-14, fx-15]
packages: [packages/cms, packages/housekeeping, packages/installer]
holo: []
timestamp: 2026-11-02T19:35:11+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:35:11+00:00"}
---

# Goal

`main` holds every review decision, and they work together.

# Steps

- [x] Run every gate and every browser suite from a clean checkout.
- [x] Update `plans/holo-port/reference/holo-differences.md`.
- [x] Close the phase.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

Results (2026-11-02T19:35:11+00:00):

- From a clean checkout, `make install` and `make gates` passed and left the tree unchanged: `gofmt`, `go vet` and `go test -race`
  in all 13 modules, the component tests, `svelte-check`, the three frontends, `sqlc generate` and `make check-docs`.
- `make e2e` passed all 395 checks in 13 suites, with every server log clean.
- The exit criteria hold:
  - every gate and browser suite passes by one command each;
  - a settings change reached a running CMS without a restart;
  - all the habbos of a user share one purse and one club membership;
  - nobody edits a group above their level, and the guard holds with direct attributes;
  - the built CMS binary served the art itself.

# Notes

- GitHub has not run the workflows yet, and the aarch64 binaries were built but not run.
