---
type: Task
title: Review the installer's layout and rebuild it on one column
description: The installer's pages are reviewed for alignment and spacing and rebuilt on one column with left-aligned steps, the settings step's groups as tabs, and its buttons kept in sight.
scope: [packages/installer, tests/e2e]
depends_on: [07-tabs-that-are-links]
skills: [landing-page-design, building-astro-components, adding-svelte-interactivity, testing-behaviours]
---

# Goal

Every step of the installer lines up, and a long step is easy to pass.

# Context

- [Spec](/features/look-and-feel/spec.md), `### The installer's layout` under `## Next`.
- [Plan](/features/look-and-feel/plan.md): the user's words on the installer's first look, under Decisions.
- `packages/installer/src/layouts/setup.astro`, `src/pages/` and `src/components/`;
  `packages/installer/knowledge/steps.md`, "The look".

# Steps

- [ ] Review first: open every step at 1366px and 375px and list each fault of alignment, width and spacing, with its
  cause in the classes. The list goes in the report.
- [ ] One column for every step: the title bar, the steps, the text, the fields and the buttons share one left edge
  and one width, and the box is as wide as that column.
- [ ] The steps' tabs start at the left edge.
- [ ] One row of buttons at the bottom of every step, in one place and order: the way on ("Skip", "Check again"), then
  the main button.
- [ ] The settings step: its six groups are tabs inside the step, with "More settings" as the last tab and its groups
  folded. Every field stays in the one form. A refused field opens its tab. With scripts off every group shows, one
  under the other.
- [ ] On a step taller than the screen, the row of buttons stays in sight at the bottom of the screen.
- [ ] Tests for each behaviour of the spec's section; the browser suites of the installer pass.
- [ ] Update `packages/installer/knowledge/steps.md`, move the spec's lines up into `## The installer`, and note the
  layout in the plan.

# Checks

```sh
make -C packages/installer check
make e2e
```

Then `make check` in every project that `make dependants project=packages/installer` prints.
