---
type: Task
title: The installer's client files step
description: An optional step between the site step and the administrator step shows the client files found in the assets folder and imports them or skips, and the administrator step imports none.
scope: [packages/installer, tests/e2e]
depends_on: []
skills: [applying-go-patterns, templating-astro-pages, building-astro-components, testing-behaviours, use-modern-go]
---

# Goal

The administrator sees which client files the hotel found, and chooses to import them or to go on without.

# Context

- [Spec](/features/installer/spec.md), `### The client files step` under `## Next`.
- [Plan](/features/installer/plan.md), "The two optional steps".
- `packages/installer/knowledge/steps.md`: the routes, and where the administrator step imports the files today.

# Steps

- [ ] `GET`, `POST /installer/client`, after the site step: the page names `<assets.path>/dcr/`, and lists
  `external_variables.txt` and `external_texts.txt` with their count of lines, or as missing.
- [ ] "Import client files" imports with `dcr.Import` and goes on to the administrator step. "Skip" goes on and
  imports nothing. With a file missing the page says where to put it and offers "Check again" and "Skip".
- [ ] The administrator step imports no client file.
- [ ] The site step goes on to this step, and a step opened before the one it follows leads to the first that waits.
  The steps' list on every page of the installer shows the new step.
- [ ] Tests for each behaviour of the spec's section, alone and inside reborn.
- [ ] The browser suites that walk the installer (`together`, `reborn` and the harness's `install`) pass through the
  step.
- [ ] Update `packages/installer/knowledge/steps.md`.

# Checks

```sh
make -C packages/installer check
make e2e
```

Then `make check` in every project that `make dependants project=packages/installer` prints.
