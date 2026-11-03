---
type: Task
title: Verify P3
description: Every exit criterion of P3 holds from a clean checkout, in a real browser.
status: todo
phase: p3
depends_on: [p3-04, p3-05, p3-08, p3-09, p3-10, p3-11]
packages: [packages/cms, tests/e2e]
holo: []
timestamp: 2026-11-03T17:26:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
---

# Goal

The phase closes on results seen from a clean checkout.

# Steps

- [ ] A guest reads a home.
- [ ] The owner places, moves, re-skins and removes items and saves.
- [ ] A purchase takes credits with a ledger row in the same transaction.
- [ ] List the differences from Holo.
- [ ] Run every gate.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
