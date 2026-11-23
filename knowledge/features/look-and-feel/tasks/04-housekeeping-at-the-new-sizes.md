---
type: Task
title: Housekeeping at the new sizes
description: Housekeeping keeps its own look, the grey bar, the navy tabs and the gold lists, with every size by the plan's rules.
scope: [packages/housekeeping, tests/e2e]
depends_on: [01-the-shared-parts]
skills: [building-astro-components, testing-behaviours]
---

# Goal

Housekeeping reads at 16px and still looks like itself.

# Context

- [Spec](/features/look-and-feel/spec.md), `### Housekeeping at today's sizes` under `## Next`, and the built
  `## Housekeeping`.
- [Plan](/features/look-and-feel/plan.md), "The sizes".
- [Housekeeping components have one look each](/decisions/holo-port/0060-housekeeping-components.md)

# Steps

- [ ] The layout, the left column and every page: fixed text sizes, widths, paddings and gaps by the plan's rules, with
  the font as the theme's `--font-sans`.
- [ ] The page fits a 1366px screen with nothing scrolling sideways.
- [ ] The browser suites pass; screenshots of the dashboard, the settings page and one data list go in the report.

# Checks

```sh
make -C packages/housekeeping check
make e2e
```

Then `make check` in every project that `make dependants project=packages/housekeeping` prints.
