---
type: Reference
title: Matching
description: How tw-color picks the closest Tailwind swatch, the margin beyond which it proposes a new shade, and the palettes it matches against.
---

# Distance

Colors are converted from sRGB to OKLCH and matched by Euclidean distance in OKLab, so the result is the perceptually
closest swatch. The distance shown by `-d` is that Euclidean distance (ΔE OKLab, rounded to 4 decimals). Because the
match is purely nearest, grays can land on any of Tailwind's neutral families, e.g. `#1f1f1f` becomes `olive-900`.

# Palette

`palette.mjs` holds the Tailwind CSS v4 palette from https://tailwindcss.com/docs/colors: 26 families with 11 shades
each, plus `black` and `white`.

# Margin

A color within the margin, an OKLab distance of 0.031 by default (`-m`), of Tailwind's palette takes the closest class.
The default lies in the widest gap near 0.03 between the distances of Holo's colours: Holo's BBCode red (0.0300) keeps
`red-600`, and BBCode green (0.0316) and the warning orange (0.0331) are beyond it.

Beyond the margin, the color takes the closest new shade of the stylesheet when one lies within the margin. Otherwise
the tool prints `new <family>-<number> <hex>`, the proposed shade:

- The family: for a color of chroma 0.05 or more, the family whose color at the same lightness has the nearest hue,
  among the families of chroma 0.05 or more there; for a greyer color, the family whose color at the same lightness
  lies nearest in OKLab. Each family's color at a lightness is interpolated between its two neighbours.
- The number: halfway between the family's lighter and darker neighbours by lightness, the new shades included, so
  `red-550` lies between `red-500` and `red-600`, and a color between `red-500` and a taken `red-550` gets `red-525`.
  Lighter than the 50 shade counts from 0, darker than the 950 shade up to 1000.
- The hex: the color's own.

# New shades

`shades.mjs` reads the stylesheet of new shades, `packages/components/src/styles/shades.css` by default (`-s`): every
`--color-<family>-<number>: <hex>;` line of its `@theme` block. `-w <note>` adds the proposed shade at the end of the
block, under the comment `/* <note> */`, and creates the stylesheet when it is missing.
