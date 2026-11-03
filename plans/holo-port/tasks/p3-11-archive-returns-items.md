---
type: Task
title: Return placed items on archive
description: Archiving a habbo returns its placed stickers and notes to the user's inventory, in the archive's transaction.
status: todo
phase: p3
depends_on: [p3-07]
packages: [packages/auth, packages/store]
holo: []
timestamp: 2026-11-03T17:26:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
---

# Goal

An archived habbo's decorations are not lost, as [0058](/decisions/0058-habbos-are-archived.md) says.

# Steps

- [ ] Stickers and notes of the habbo's home go back to the inventory, notes as blank notes.
- [ ] The background needs nothing ([0064](/decisions/0064-backgrounds-are-unlocks.md)).

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
