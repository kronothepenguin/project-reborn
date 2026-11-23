---
type: Task
title: Every page of the site at the new sizes
description: Each page and component of the site replaces its fixed sizes and widths by the plan's rules, so the whole site reads at 16px on the 1240px page.
scope: [packages/cms, tests/e2e]
depends_on: [02-the-community-layout]
skills: [building-astro-components, adding-svelte-interactivity, testing-behaviours]
---

# Goal

No page of the site keeps a size of the old 11px design.

# Context

- [Spec](/features/look-and-feel/spec.md), `### Sizes` under `## Next`.
- [Plan](/features/look-and-feel/plan.md), "The sizes".
- [The comparison](/features/look-and-feel/research-holo-look.md), sections 10 and 11.

# Steps

- [ ] Every page and component under `packages/cms/src`: fixed text sizes, widths, paddings and gaps by the plan's
  rules. Home pages and the Help Tool keep their canvas; pictures keep their size.
- [ ] Each tabbed box names its `Tabs color` as Holo's page has it.
- [ ] A list in the report of every page, with a screenshot at 1366px, and of every place where Holo's proportions
  could not be kept.
- [ ] The browser suites pass.

# Checks

```sh
make -C packages/cms check
make e2e
```

Then `make check` in every project that `make dependants project=packages/cms` prints.
