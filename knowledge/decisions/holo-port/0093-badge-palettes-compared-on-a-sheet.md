---
type: Decision
title: The badge palettes are compared on one sheet
description: Once the badge renderer works, one sheet shows the 18 tints and sample badges in both palettes side by side, the user picks one and the other is deleted, and until then the Tailwind palette is live.
status: accepted
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
tags: [groups, colours, p5]
---

# Decision

- Once the badge renderer works, one sheet shows the 18 tints and sample badges, drawn by the renderer in both palettes
  of [0042](/decisions/holo-port/0042-two-badge-palettes.md), side by side.
- The user picks one palette from the sheet, and the other is deleted from the renderer and the badge editor.
- Until then the Tailwind palette is live, as the colour rule wants. Nothing temporary enters the code: no setting
  switches the palettes, and badge addresses carry no palette.

# Context

0042 left open how the user compares the two palettes. Offered a sheet or a temporary switch in housekeeping, the user
chose the sheet.

# Consequences

- The renderer takes its palette as data, so that the sheet can draw both.
- A task of P5 deletes the palette the user does not pick.
