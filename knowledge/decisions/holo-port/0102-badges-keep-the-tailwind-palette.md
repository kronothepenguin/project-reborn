---
type: Decision
title: Group badges keep the Tailwind palette
description: The user picked the closest Tailwind colours for the 18 group badge tints, olive-500 for tint 15 among them, and Holo's palette left the renderer and its tests; tint 15 is a known issue.
status: accepted
timestamp: 2026-11-06T18:40:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T18:40:48+00:00"}
tags: [groups, colours]
---

# Decision

- The 18 group badge tints are the closest Tailwind colours of `tools/tw-color`, the palette live since P5 started,
  olive-500 for tint 15 among them.
- Holo's palette leaves the renderer and its tests, with the two tests that compared the renderer with `badge.php`'s
  own drawings, and those drawings. The renderer draws in the one palette, so `Draw` takes no palette.
- Tint 15, olive-500 (`#7c7c67`), looks grey-olive beside Holo's brown `#977641`, and no Tailwind colour looks like
  it. It is a known issue in `knowledge/features/look-and-feel/later.md`, to be fixed later.

# Context

[0042](/decisions/holo-port/0042-two-badge-palettes.md) built both palettes, and
[0093](/decisions/holo-port/0093-badge-palettes-compared-on-a-sheet.md) compared them on a sheet. Shown the sheet, the user
answered: "tailwind colors looks like the same, but there is olive-500 that doesn't look like #977641. i would like
tailwind color if you can somehow fix it to look similar, like a bronce or brown...". Shown tint 15 in yellow-700,
yellow-800, amber-800 and taupe-500, the user answered: "none looks like the original, you can use the closest,
olive-500, but add this to known issues to fix it later".

Told that the renderer's two strongest tests compared it pixel for pixel with 73 drawings made by Holo's own
`badge.php` and with Holo's default badge, which exist only in Holo's colours, and offered to keep Holo's tints in the
tests alone or to remove them, the user chose to remove them.

# Consequences

- The renderer is checked against its own rules: the codes `Parse` takes and refuses, the parts it loads, the tints,
  the colours a GIF can hold and the encoding, and no longer against `badge.php`'s drawings.
- The badge editor already held the Tailwind palette, and a test keeps it equal to the renderer's.
- [Holo colours mapped to Tailwind](/colours.md#group-badge-tints) keeps its table of Holo's tints and their
  Tailwind colours, as it does for every colour of Holo.
