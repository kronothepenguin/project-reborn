---
type: Task
title: Verify P5
description: Every exit criterion of P5 holds from a clean checkout, in a real browser.
status: done
phase: p5
depends_on: [p5-01, p5-02, p5-03, p5-04, p5-05, p5-06, p5-07, p5-08, p5-09, p5-10, p5-11, p5-12, p5-13, p5-14, p5-15, p5-16, p5-17, p5-18]
packages: [packages/cms, packages/housekeeping, packages/store, packages/components, packages/virtual, tests/e2e]
holo: []
timestamp: 2026-11-06T19:03:32+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T19:03:32+00:00"}
---

# Goal

[P5](/phases/p5-groups-forum.md) meets its exit criteria.

# Steps

- [x] From a clean clone: install, every gate and every browser suite.
- [x] Buying a group debits credits with a ledger row; join, request, accept, promote, leave and favourite work; the
  badge editor saves a code that the renderer draws.
- [x] Threads and posts are created, edited, previewed, moderated and reported.
- [x] The [differences](/reference/holo-differences.md) list every way P5 differs from Holo.

# Verification

```sh
make e2e
```

Results (2026-11-06):

- A fresh worktree of `p5` at `e0baf686`, holding only committed files, stands for the clean clone. `make install`
  passes and changes no tracked file.
- `make gates` passes: every Go module's `gofmt`, `go vet` and `go test -race`, the components' tests and
  `svelte-check` with 0 errors and 0 warnings, the sqlc diff and the store's docs check.
- `make e2e`: all 26 browser suites pass, 970 checks. `groups` (74) buys a group from the shared purse with its ledger
  row, joins, requests, accepts, promotes, leaves and favours, and saves a badge code that the renderer draws; `forum`
  (59) creates, previews, edits, moderates and reports threads and posts.
- Every P5 task recorded its differences from Holo in [the differences](/reference/holo-differences.md); p5-16, p5-17,
  p5-18 and the spelling fix of p5-16 added theirs on 2026-11-06.

# Notes

- After this check `main` gained s0-03, the game server's package and runner; it was merged into `p5`, and the gates ran
  again on the merged result before `p5` reached `main`.

