---
type: Task
title: Verify P7
description: Every exit criterion of P7 holds from a clean checkout, in a real browser.
status: todo
phase: p7
depends_on: [p7-01, p7-02]
packages: [packages/cms, packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-09T18:04:21+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:04:21+00:00"}
---

# Goal

P7 meets its [exit criteria](/phases/p7-help.md#exit-criteria).

# Steps

- [ ] From a clean worktree of `main`: install, every gate, and every browser suite.
- [ ] A request sent on `/help` shows in housekeeping's Help Queries, where staff pick it up and close it; once it is
  picked up, the habbo sends another.
- [ ] [Holo's differences](/reference/holo-differences.md) lists every difference P7 made.
- [ ] P7 is done.

# Verification

```sh
pnpm install --frozen-lockfile --prefer-offline && make gates
cd tests/e2e && pnpm test
```

# Notes

- Runs on the branch `p7`.
