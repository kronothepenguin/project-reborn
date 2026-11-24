---
type: Task
title: The settings step's groups as collapsible sections
description: The installer's settings step shows its six groups and More settings as sections that open and close, in place of the tabs inside the step.
scope: [packages/installer, tests/e2e]
depends_on: []
skills: [building-astro-components, testing-behaviours]
---

# Goal

The settings step is short, reads top to bottom, and fits a phone.

# Context

- [Spec](/features/look-and-feel/spec.md), `### The settings step's sections` under `## Next`.
- [Plan](/features/look-and-feel/plan.md), "The installer's layout".
- `packages/installer/src/pages/settings.astro` and `src/components/settings/`.

# Steps

- [ ] Each of the six groups is a `<details>` with its title as the `<summary>`: the first open, the others closed.
  "More settings" is the last section, closed, with its groups as sections inside it.
- [ ] A section's title row is one line as wide as the column, with a mark that shows whether it is open, in Holo's
  colours.
- [ ] A refused save opens the section of the field it names.
- [ ] The island `settings-tabs.svelte` goes: the step needs no script.
- [ ] The row of buttons stays as it is, in sight at the bottom.
- [ ] Tests for each behaviour of the spec's section; the suite `installer-layout` follows.
- [ ] Update `packages/installer/knowledge/steps.md`, replace the spec's lines on the tabs under `## The installer`
  with these, and note the sections in the plan.

# Checks

```sh
make -C packages/installer check
make e2e
```

Then `make check` in every project that `make dependants project=packages/installer` prints.
