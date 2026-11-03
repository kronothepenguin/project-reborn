---
type: Task
title: Return placed items on archive
description: Archiving a habbo returns its placed stickers and notes to the user's inventory, in the archive's transaction.
status: done
phase: p3
depends_on: [p3-07]
packages: [packages/auth, packages/store]
holo: []
timestamp: 2026-11-03T17:56:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:56:17+00:00"}
---

# Goal

An archived habbo's decorations are not lost, as [0058](/decisions/0058-habbos-are-archived.md) says.

# Steps

- [x] Stickers and notes of the habbo's home go back to the inventory, notes as blank notes.
- [x] The background needs nothing ([0064](/decisions/0064-backgrounds-are-unlocks.md)).

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-03T17:56:17+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/auth`, and the tests of `packages/cms` pass.
- A test archives a habbo whose home holds two stickers, a note and a background: the stickers and the note come back to
  the inventory, the background stays held once, and the profile widget stays on the home.
- Breaking these on purpose fails the test: not returning the items, and returning none of each.

# Notes

- None.
