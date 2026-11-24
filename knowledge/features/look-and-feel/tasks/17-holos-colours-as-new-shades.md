---
type: Task
title: Holo's colours as new shades of the palette
description: The colour tool takes a margin of distance, proposes a new shade of the nearest family for a colour beyond it, and knows the shades added; Holo's red, brown and every other colour beyond the margin become such shades.
scope: [tools/tw-color, packages/components, packages/cms, packages/housekeeping, packages/installer, knowledge]
depends_on: []
skills: [building-svelte-primitives, testing-behaviours]
---

# Goal

Where Tailwind's palette has no colour close to Holo's, the palette gains one.

The user, 2026-11-24: "do you think we can extend tailwinds palette or produce something similar? this way we can
define some margins for the distance, and if tw palette does not match the distance criteria, we can extend tailwind's
palette to inclue new shades based on the color we missed. this implies updating the tool to detect custom colors
too."

# Context

- [Spec](/features/look-and-feel/spec.md), `### Holo's colours` under `## Next`.
- [Plan](/features/look-and-feel/plan.md), "The colours".
- `tools/tw-color` and its knowledge; [the colours](/colours.md).

# Steps

- [ ] One stylesheet holds the new shades as theme colours, such as `--color-red-550: #d64242`, and every app's
  stylesheet imports it.
- [ ] `tw-color` takes a margin, an OKLab distance with a default: for a colour beyond it, it proposes a new shade,
  named by the family of the nearest hue and a number between its lighter and darker neighbours.
- [ ] `tw-color` reads the stylesheet of new shades, so a colour added once is found again by its class.
- [ ] Every colour of [the colours](/colours.md) is run again: those beyond the margin become new shades, the table
  shows each colour's class and distance, and the classes in the code follow.
- [ ] A text on a coloured panel reads clearly: the club's buy panel shows its prices in Holo's light text.
- [ ] Tests of the tool: a colour within the margin gets its class, one beyond it gets a proposed shade, an added shade
  is found.
- [ ] Side-by-side pictures of the club page and of one page with a brown title bar, beside Holo's.

# Checks

```sh
make -C tools/tw-color check
make -C packages/components check
make -C packages/cms check
make e2e
```

Then `make check` in every project that `make dependants project=packages/components` prints.
