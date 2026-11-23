---
type: Task
title: The shared parts at the new sizes, with Holo's tabs and boxes
description: Every primitive of packages/components takes the new sizes, Tabs gains a color and Holo's look inside boxes, and the box's frame and title bars match Holo's.
scope: [packages/components]
depends_on: []
skills: [building-svelte-primitives, testing-behaviours]
---

# Goal

The parts every app shares look like Holo's, at the new sizes.

# Context

- [Spec](/features/look-and-feel/spec.md), `### Sizes` and `### Tabs inside boxes` under `## Next`.
- [Plan](/features/look-and-feel/plan.md), "The sizes" and "The tabs": the `Tabs` shape is the user's, build it
  exactly as written there.
- [The comparison](/features/look-and-feel/research-holo-look.md), sections 5, 6 and 7: Holo's numbers for the tabs
  inside boxes, the box's frame and the title bars.
- [The colours](/colours.md).

# Steps

- [ ] Every primitive: its fixed sizes become the classes of the plan's table, and its paddings Holo's times 4/3 on
  Tailwind's scale.
- [ ] `Tabs` takes `color`: `"blue"`, `"green"` or `"orange"`, `"blue"` by default. `TabList` draws the row's line in
  it. `Tab` is filled with it and has white text; the selected one is white with an outline in it and bold black text.
- [ ] `Paper` and `Card`: Holo's frame, corner and insets, and the title bars' size, padding and colours, each colour
  the closest class of Holo's hue.
- [ ] A story and a behaviour test for each change.
- [ ] Update the package's knowledge and [the colours](/colours.md).

# Checks

```sh
make -C packages/components check
make e2e
```

Then `make check` in every project that `make dependants project=packages/components` prints.
