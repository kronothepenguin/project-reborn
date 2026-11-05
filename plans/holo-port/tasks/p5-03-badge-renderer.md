---
type: Task
title: Draw group badges
description: packages/cms/internal/badge draws a checked badge code from Holo's part images in either palette, GET /habbo-imaging/badge/{code} serves it for good, a GroupBadge primitive shows it, and a sheet compares the palettes.
status: done
phase: p5
depends_on: []
packages: [packages/cms, packages/components]
holo: [source/holo/habbo-imaging/badge.php, source/holo/habbo-imaging/badges]
timestamp: 2026-11-05T19:44:10+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:44:10+00:00"}
---

# Goal

Group badges draw as Holo's `badge.php` drew them, safely, in both palettes for the user to compare
([format](/reference/holo-protocols.md#group-badges), [0042](/decisions/0042-two-badge-palettes.md),
[0093](/decisions/0093-badge-palettes-compared-on-a-sheet.md)).

# Steps

- [x] Holo's base, symbol and overlay images are embedded, and a code draws as `badge.php` draws it: the canvas, each
  layer tinted by its grey level, an overlay untinted on top, and the symbols at their nine positions.
- [x] A strict check of the code: Holo's layout, shapes 01–24, symbols 01–67, tints 01–18 and positions 0–8. Anything
  else answers 404, never a file name.
- [x] Two palettes as data: Holo's 18 tints, and the closest Tailwind colours from `tools/tw-color`. The Tailwind
  palette is live.
- [x] `GET /habbo-imaging/badge/{code}` answers the image with a year-long immutable cache.
- [x] A `GroupBadge` primitive in `packages/components`, with a story, a test and its export.
- [x] The sheet: the 18 tints and sample badges in both palettes side by side, given to the user to pick from.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
pnpm --filter @project-reborn/components test
```

Results (2026-11-05T19:44:10+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`; the components' 163 tests, `svelte-check` and the
  Storybook build pass.
- In Holo's palette the renderer draws as Holo's own `badge.php`, pixel for pixel:
  - Holo's cached drawing of the default badge, from `habbo-imaging/badge-fill`;
  - 1,080 codes drawn by Holo's `badge.php` in a throwaway container of the user's `holo-php` image, PHP 5.6.40 with
    GD 2.1.0: every base in two tints, every symbol at every position, every symbol in white alone and on a base, and
    300 random badges. None differs. 73 of them, covering every base, every symbol with an overlay, every position
    and a dozen whole badges, stay in `internal/badge/testdata/holo` for the tests.
- The check refuses 30 codes the editor would not write, from an empty code to a path, a fifth symbol, a tint 19, a
  position 9 and other digits; `GET /habbo-imaging/badge/{code}` answers them 404, and a code it takes with a GIF
  of the live palette, `Cache-Control: public, max-age=31536000, immutable` and `nosniff`.
- No badge can need more colours than a GIF holds: the largest base and four largest symbols with their overlays need
  fewer than 256.
- Breaking these on purpose fails a test: rounding the tint, the grid's middle row or column moved by a pixel, the
  overlay left out or tinted, the base drawn last, a position 9, a fifth symbol, a base without its `X`, the grey
  level over 256, a part 00, the route drawing in Holo's palette or a bad code, and the cache header left out.
- The sheet `badge-palettes.html` shows the 18 tints, a symbol and a base in each, and eight whole badges, in both
  palettes side by side; its screenshots were read by eye.

# Notes

- Holo's `habbo-imaging/badge-fill/b0503Xs09114s05013s05015.gif` is its own drawing of the default badge, and the
  renderer in Holo's palette is checked against it.
- GD kept every colour of a layer exactly, since no part comes close to 256 colours, and a white tint stayed opaque,
  since the canvas's transparent white is marked transparent. So the renderer composes in RGBA: each colour of a part
  times its grey level, truncated as PHP did, the overlay untinted on top, and the layers in order.
- The palettes are data: `badge.Holo`, `badge.Tailwind`, and `badge.Live`, which is Tailwind's until the user picks
  ([0093](/decisions/0093-badge-palettes-compared-on-a-sheet.md)). Seven Tailwind swatches lie outside sRGB and are
  clipped, as their usual hex values are; [colours](/reference/colours.md#group-badge-tints) lists them.
- The parts are Holo's GIFs, embedded in `packages/cms/internal/badge/parts`.
- Browsers keep a drawing for a year, so after [p5-18](/tasks/p5-18-keep-one-badge-palette.md) changes the palette, a
  browser that already showed a badge needs a hard reload; no hotel runs the port yet.
- `GroupBadge` shows `/habbo-imaging/badge/{code}`, which only the CMS serves, so its story shows no picture, as the
  editor's smilies show none in Storybook.
