---
type: Task
title: The installer's own page from Habbo parts
description: The installer gets a layout of its own built from the shared parts, title bars, two-tone buttons and the steps as tabs, in Holo's colours and font at the new sizes.
scope: [packages/installer, tests/e2e]
depends_on: [01-the-shared-parts, installer/03-the-settings-step]
skills: [building-astro-components, templating-astro-pages, testing-behaviours]
---

# Goal

Installing a hotel looks like the hotel.

# Context

- [Spec](/features/look-and-feel/spec.md), `### The installer` under `## Next`.
- [Plan](/features/look-and-feel/plan.md), "The sizes" and "The tabs".
- `packages/installer/src/layouts/setup.astro` and its pages; `packages/installer/knowledge/steps.md`.

# Steps

- [ ] The layout: Holo's font and colours, the hotel's logo, and one box per step with its title bar.
- [ ] The steps show as tabs in their order, the current one selected; a step still to come is shown and cannot be
  opened.
- [ ] Every form uses the shared buttons and fields; "Skip" and "Check again" are the plain buttons, and the step's
  main button the green one.
- [ ] The pages work under reborn's own project and alone.
- [ ] The browser suites pass; a screenshot of each step goes in the report.

# Checks

```sh
make -C packages/installer check
make e2e
```

Then `make check` in every project that `make dependants project=packages/installer` prints.
