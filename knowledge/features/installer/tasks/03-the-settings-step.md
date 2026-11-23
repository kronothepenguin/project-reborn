---
type: Task
title: The installer's settings step
description: An optional step after the site step shows six groups of day-one settings open and every other setting folded under "More settings", saves the changed ones or skips.
scope: [packages/installer, tests/e2e]
depends_on: [01-settings-groups, 02-the-client-files-step]
skills: [applying-go-patterns, templating-astro-pages, building-astro-components, testing-behaviours, use-modern-go]
---

# Goal

An administrator sets the hotel's first settings while installing, with the labels housekeeping shows.

# Context

- [Spec](/features/installer/spec.md), `### The settings step` under `## Next`.
- [Plan](/features/installer/plan.md), "The two optional steps": the six groups and their keys, and what "More
  settings" holds.
- `packages/settings`: `Groups()`, `Validate` and `Set`.

# Steps

- [ ] `GET`, `POST /installer/settings`, between the site step and the client files step.
- [ ] The page shows the six groups of the plan open, each field with its label, its help and its current value, and
  "More settings" folded with every other field under its group's title, less the fields the plan leaves out.
- [ ] "Save settings" validates every changed value together, saves them, and goes on to the client files step. A
  refused value shows the form again with the field named, and saves nothing. "Skip" goes on and saves nothing.
- [ ] The mail password shows empty, and an empty value keeps the saved one.
- [ ] Tests for each behaviour of the spec's section, alone and inside reborn.
- [ ] The browser suites that walk the installer pass through the step; one of them changes a setting there and reads
  it in housekeeping.
- [ ] Update `packages/installer/knowledge/steps.md`, move the spec's `## Next` lines up, and the plan's rows to
  `Built:`.

# Checks

```sh
make -C packages/installer check
make e2e
```

Then `make check` in every project that `make dependants project=packages/installer` prints.
