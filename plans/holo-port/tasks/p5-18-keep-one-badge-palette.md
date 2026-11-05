---
type: Task
title: Keep the badge palette the user picks
description: Once the user picks a palette from the sheet, the other is deleted from the renderer, the badge editor's colour data and the docs.
status: todo
phase: p5
depends_on: [p5-03, p5-09]
packages: [packages/cms]
holo: []
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

One palette remains, the one the user picked ([0042](/decisions/0042-two-badge-palettes.md),
[0093](/decisions/0093-badge-palettes-compared-on-a-sheet.md)).

# Steps

- [ ] The user's pick becomes a decision.
- [ ] The other palette leaves the renderer, the badge editor's colour data, the tests and the
  [colours](/reference/colours.md#group-badge-tints).

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs groups
```
