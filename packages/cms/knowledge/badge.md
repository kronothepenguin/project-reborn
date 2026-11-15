---
type: Go Package
title: badge
description: The renderer that checks a group badge code and draws it as Holo's habbo-imaging/badge.php did, in the Tailwind palette.
resource: packages/cms/internal/badge
---

# Use

- `GET /habbo-imaging/badge/{code}` draws a badge as a GIF. A code that Holo's badge editor would not write answers
  404.
- The answer carries `Cache-Control: public, max-age=31536000, immutable`, so browsers keep a drawing for a year.
- The parts are Holo's GIFs, embedded from `internal/badge/parts`.
- The palette is the closest Tailwind colour to each of Holo's 18 tints (decision holo-port/0102).

# The badge editor

- The badge editor's `data/badge_data.xml` holds the same palette. `TestTheBadgeEditorSharesTheTailwindPalette` in
  `badge_test.go` keeps the two equal.
- The editor's own preview multiplies its grey sprites by a tint, which matches the renderer's grey level times the
  tint on grey art.
- How the editor is built is in [HabboWidgets](/habbo-widgets.md).
