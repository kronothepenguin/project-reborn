---
type: Task
title: Verify P5
description: Every exit criterion of P5 holds from a clean checkout, in a real browser.
status: todo
phase: p5
depends_on: [p5-01, p5-02, p5-03, p5-04, p5-05, p5-06, p5-07, p5-08, p5-09, p5-10, p5-11, p5-12, p5-13, p5-14, p5-15, p5-16, p5-17, p5-18]
packages: [packages/cms, packages/housekeeping, packages/store, packages/components, packages/virtual, tests/e2e]
holo: []
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

[P5](/phases/p5-groups-forum.md) meets its exit criteria.

# Steps

- [ ] From a clean clone: install, every gate and every browser suite.
- [ ] Buying a group debits credits with a ledger row; join, request, accept, promote, leave and favourite work; the
  badge editor saves a code that the renderer draws.
- [ ] Threads and posts are created, edited, previewed, moderated and reported.
- [ ] The [differences](/reference/holo-differences.md) list every way P5 differs from Holo.

# Verification

```sh
make e2e
```
