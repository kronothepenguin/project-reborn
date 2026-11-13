---
type: Reference
title: Accepted input
description: The color formats tw-color reads and how it prints alpha.
---

# Formats

- `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`
- `rgb(r, g, b)` and `rgba(r, g, b, a)` with channels 0-255 and alpha 0-1

# Alpha

Blank lines are ignored. Alpha below 1 is rounded to a whole percentage and printed as a Tailwind opacity modifier
(`black/50`); alpha is ignored when matching.
