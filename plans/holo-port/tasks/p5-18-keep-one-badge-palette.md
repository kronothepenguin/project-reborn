---
type: Task
title: Keep the badge palette the user picks
description: Once the user picks a palette from the sheet, the other is deleted from the renderer, the badge editor's colour data and the docs.
status: done
phase: p5
depends_on: [p5-03, p5-09]
packages: [packages/cms]
holo: []
timestamp: 2026-11-06T18:46:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T18:46:00+00:00"}
---

# Goal

One palette remains, the one the user picked ([0042](/decisions/0042-two-badge-palettes.md),
[0093](/decisions/0093-badge-palettes-compared-on-a-sheet.md)).

# Steps

- [x] The user's pick becomes a decision.
- [x] The other palette leaves the renderer, the badge editor's colour data, the tests and the
  [colours](/reference/colours.md#group-badge-tints).

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs groups
```

Results (2026-11-06):

- `gofmt` and `go vet ./...` in `packages/cms`: clean.
- `go test ./... -race` in `packages/cms`: every package passes, `internal/badge` with its tests of `Parse`, the
  parts, the tints, the colours of a GIF and the encoding, and the CMS with the route and the editor's palette.
- `pnpm test groups` in `tests/e2e`: 74 checks pass.

# Notes

- The user kept the Tailwind palette ([0102](/decisions/0102-badges-keep-the-tailwind-palette.md)) from a sheet drawn
  again with the renderer, since p5-03's had not been kept: the 18 tints, a base and a symbol in each, and eight whole
  badges, in both palettes side by side.
- Tint 15, olive-500, looks grey-olive beside Holo's brown `#977641`. Drawn in yellow-700, yellow-800, amber-800 and
  taupe-500, none looked like it to the user, so olive-500 stays and the issue is listed in `plans/later.md`.
- `badge.Holo` and `badge.Live` are gone, and `Draw` takes no palette. The tests that compared the renderer with
  `badge.php`'s drawings left with `testdata/`, as the user chose; the tint test now uses tint 10, red-700, which has
  no green. The badge editor's `badge_data.xml` already held the Tailwind colours.
- [Holo colours mapped to Tailwind](/reference/colours.md#group-badge-tints) keeps Holo's tints beside their Tailwind
  colours, as it does for every colour of Holo.

