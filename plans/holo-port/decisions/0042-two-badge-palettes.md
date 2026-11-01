---
type: Decision
title: Group badges get two palettes
description: P5 builds the group badge tints twice, with Holo's exact colours and with the closest Tailwind colours, and the user picks one once both work.
status: accepted
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [groups, colours]
---

# Decision

- The Tailwind colour rule stays a hard rule.
- P5 implements two palettes for the 18 group badge tints: Holo's exact colours, and the closest Tailwind colours from
  `tools/tw-color`.
- The user picks one once both are implemented. The other is then removed.

# Context

The plan kept the tints as in Holo, as the one exception to the Tailwind rule, and waited for confirmation. The user
answered: "good question, i would like to have the hard rule of tailwind colors, please create two palettes, i will decide
once this is implemented".

# Consequences

- The badge renderer in P5 takes the palette as data, so that both can be compared.
