---
type: Task
title: Verify ED
description: Every exit criterion of ED holds from a clean checkout, in a real browser.
status: todo
phase: ed
depends_on: [ed-02, ed-03, ed-04]
packages: [packages/components, packages/cms, packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
---

# Goal

ED meets its exit criteria ([ED](/phases/ed-bbcode-editor.md)).

# Steps

- [ ] From a clean clone: `make install`, `make gates` and `make e2e` pass and leave the tree unchanged.
- [ ] Each exit criterion is seen in a real browser, with screenshots read.

# Verification

```sh
make install && make gates && make e2e && git status --short
```
