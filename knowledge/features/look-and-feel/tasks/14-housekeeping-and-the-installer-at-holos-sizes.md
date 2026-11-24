---
type: Task
title: Housekeeping and the installer at Holo's sizes
description: Housekeeping and the installer keep their own looks with the site's 12px text and the shared parts' sizes.
scope: [packages/housekeeping, packages/installer, tests/e2e]
depends_on: []
skills: [building-astro-components, testing-behaviours]
---

# Goal

One size of text everywhere: the site's.

The user, 2026-11-24: "make installer and reborn same text-xs font-size as the site for now."

# Context

- [Spec](/features/look-and-feel/spec.md), `### Holo's styling, cloned` under `## Next`, its last line.
- [Plan](/features/look-and-feel/plan.md), "The sizes" and "The installer's layout".
- Housekeeping before the bigger design: `git show 5da33309^:<path>` gives each of its files at the small sizes.
- `packages/installer/knowledge/steps.md`, "The look".

# Steps

- [ ] Housekeeping: body text `text-xs`, its layout's widths and gaps as before the bigger design, its own look
  unchanged: the grey bar, the navy tabs, the gold lists.
- [ ] The installer: body text `text-xs`, its one column, its stepper, its sections and its row of buttons kept, with
  the column's width fitted to the smaller text.
- [ ] Each looked at in screenshots at 1366px, and what reads oddly fixed.
- [ ] The browser suites follow.

# Checks

```sh
make -C packages/housekeeping check
make -C packages/installer check
make e2e
```

Then `make check` in every project that `make dependants project=<folder>` prints for both.
