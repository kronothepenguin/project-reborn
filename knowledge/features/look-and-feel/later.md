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

# Phones and tablets

The user, 2026-11-24: "just mention that in the future we want to provide mobile support but keep it looking good,
this means the style looks as it should be, the news image should match the size, same for the me user info card, tabs
and any other stuff." Earlier that day: "for mobile we have one column and everything is full width, for tablet and
bigger screens we could have two columns."

- A first attempt, with text at 16px, was set aside with the bigger design. Its flexbox layout is in the history
  (`296a7cdc`).
- Pictures keep their size on every screen: a box is designed around its picture, never the picture stretched to
  the box.

# The site at a bigger size

The user wanted Holo's 11px text at today's 16px. Two attempts failed by eye: growing text, widths and pictures by
different factors broke Holo's proportions, and growing pictures made the pixel art ugly. A next attempt starts from
the cloned site, with text alone bigger and boxes designed around pictures at their own size.

