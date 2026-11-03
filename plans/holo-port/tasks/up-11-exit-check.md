---
type: Task
title: Verify UP
description: Every exit criterion of UP holds from a clean checkout, in a real browser.
status: in-progress
phase: up
depends_on: [up-01, up-02, up-03, up-04, up-05, up-06, up-07, up-08, up-09, up-10, up-12]
packages: [packages/store, packages/auth, packages/config, packages/cms, packages/housekeeping, packages/installer, tests/e2e]
holo: []
timestamp: 2026-11-03T23:48:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
---

# Goal

UP meets its [exit criteria](/phases/up-database-updates.md#exit-criteria).

# Steps

- [ ] From a clean checkout: `make install`, `make gates` and `make e2e`, with the tree unchanged after each.
- [ ] Read every screenshot of the phase.
- [ ] Record the differences from Holo in [Where the port differs from Holo](/reference/holo-differences.md).
- [ ] Close the phase: UP done, and the next phase in [the index](/index.md).

# Verification

```sh
make install && make gates && make e2e
```
