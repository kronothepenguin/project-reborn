---
type: Task
title: Verify P4
description: Every exit criterion of P4 holds from a clean checkout, in a real browser, with p4-housekeeping merged.
status: todo
phase: p4
depends_on: [p4-01, p4-02, p4-03, p4-04, p4-05, p4-06, p4-07, p4-08, p4-09, p4-10, p4-11]
packages: [packages/cms, packages/housekeeping, packages/store, packages/virtual, tests/e2e]
holo: []
timestamp: 2026-11-04T01:28:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
---

# Goal

P4 meets its [exit criteria](/phases/p4-community.md#exit-criteria).

# Steps

- [ ] `p4-housekeeping` merged into `main`, with every gate passing on the result.
- [ ] From a clean checkout: `make install`, `make gates` and `make e2e`, with the tree unchanged after each.
- [ ] Read every screenshot of the phase.
- [ ] Record the differences from Holo in [Where the port differs from Holo](/reference/holo-differences.md).
- [ ] Close the phase.

# Verification

```sh
make install && make gates && make e2e
```

# Notes

- None yet.
