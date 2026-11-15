---
type: Note
title: "Look and feel: Holo's look at today's sizes: later"
description: Work set aside for the look and feel: the known issue of group badge tint 15.
---

# Known issues

Issues the user has seen and chose to fix later.

## Group badge tint 15 is not brown

Group badges use the closest Tailwind colour to each of Holo's 18 tints
([holo-port 0102](/decisions/holo-port/0102-badges-keep-the-tailwind-palette.md)). For tint 15 that is olive-500
(`#7c7c67`), which looks grey-olive beside Holo's brown `#977641`, and none of yellow-700, yellow-800, amber-800 or
taupe-500 looked like it either. The palette is `packages/cms/internal/badge/badge.go`, and the badge editor's copy is
`packages/cms/public/habbo-widgets/badge-editor/data/badge_data.xml`.

The user: "none looks like the original, you can use the closest, olive-500, but add this to known issues to fix it
later".
