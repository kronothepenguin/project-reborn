---
type: Task
title: Draw group badges
description: packages/cms/internal/badge draws a checked badge code from Holo's part images in either palette, GET /habbo-imaging/badge/{code} serves it for good, a GroupBadge primitive shows it, and a sheet compares the palettes.
status: todo
phase: p5
depends_on: []
packages: [packages/cms, packages/components]
holo: [source/holo/habbo-imaging/badge.php, source/holo/habbo-imaging/badges]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Group badges draw as Holo's `badge.php` drew them, safely, in both palettes for the user to compare
([format](/reference/holo-protocols.md#group-badges), [0042](/decisions/0042-two-badge-palettes.md),
[0093](/decisions/0093-badge-palettes-compared-on-a-sheet.md)).

# Steps

- [ ] Holo's base, symbol and overlay images are embedded, and a code draws as `badge.php` draws it: the canvas, each
  layer tinted by its grey level, an overlay untinted on top, and the symbols at their nine positions.
- [ ] A strict check of the code: Holo's layout, shapes 01–24, symbols 01–67, tints 01–18 and positions 0–8. Anything
  else answers 404, never a file name.
- [ ] Two palettes as data: Holo's 18 tints, and the closest Tailwind colours from `tools/tw-color`. The Tailwind
  palette is live.
- [ ] `GET /habbo-imaging/badge/{code}` answers the image with a year-long immutable cache.
- [ ] A `GroupBadge` primitive in `packages/components`, with a story, a test and its export.
- [ ] The sheet: the 18 tints and sample badges in both palettes side by side, given to the user to pick from.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
pnpm --filter @project-reborn/components test
```

# Notes

- Holo's `habbo-imaging/badge-fill/b0503Xs09114s05013s05015.gif` is its own drawing of the default badge, and the
  renderer in Holo's palette is checked against it.
