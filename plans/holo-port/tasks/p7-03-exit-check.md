---
type: Task
title: Verify P7
description: Every exit criterion of P7 holds from a clean checkout, in a real browser.
status: done
phase: p7
depends_on: [p7-01, p7-02]
packages: [packages/cms, packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-09T18:39:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:04:21+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:39:41+00:00"}
---

# Goal

P7 meets its [exit criteria](/phases/p7-help.md#exit-criteria).

# Steps

- [x] From a clean worktree of `main`: install, every gate, and every browser suite.
- [x] A request sent on `/help` shows in housekeeping's Help Queries, where staff pick it up and close it; once it is
  picked up, the habbo sends another.
- [x] [Holo's differences](/reference/holo-differences.md) lists every difference P7 made.
- [x] P7 is done.

# Verification

```sh
pnpm install --frozen-lockfile --prefer-offline && make gates
cd tests/e2e && pnpm test
```

Results (2026-11-09T18:39:41+00:00):

- A fresh worktree of `p7` at `c5ddd303`, holding only committed files, stands for the clean checkout; it was removed
  with its branch afterwards. `make install` passes and changes no tracked file.
- `make gates` passes: every Go module's `gofmt`, `go vet` and `go test -race`, 26 packages with tests, the
  components' 167 tests and `svelte-check` with 0 errors and 0 warnings, the sqlc diff and the store's docs check.
- `make e2e`: all 31 browser suites pass, 1100 checks.
- The exit criterion: in `help`, Frank's request sent on `/help` shows in housekeeping's Help Queries with his name,
  Admin-1 picks it up, and Frank sends another; `housekeeping-users` closes a picked-up ticket, after which it leaves
  the queue and stays readable.
- [Holo's differences](/reference/holo-differences.md) lists P7's differences: the `Help` settings form, the address
  `/help`, signing in first, the two lengths, one waiting request per habbo, the text kept as typed, and `0` and
  spaces; `The page behind Help` left the list of what waits for a later phase.

# Notes

- Runs on the branch `p7`.
