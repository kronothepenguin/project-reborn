---
type: Reference
title: Matching
description: How tw-color picks the closest Tailwind swatch, and the palette it matches against.
---

# Distance

Colors are converted from sRGB to OKLCH and matched by Euclidean distance in OKLab, so the result is the perceptually
closest swatch. The distance shown by `-d` is that Euclidean distance (ΔE OKLab, rounded to 4 decimals). Because the
match is purely nearest, grays can land on any of Tailwind's neutral families, e.g. `#1f1f1f` becomes `olive-900`.

# Palette

`palette.mjs` holds the Tailwind CSS v4 palette from https://tailwindcss.com/docs/colors: 26 families with 11 shades
each, plus `black` and `white`.
