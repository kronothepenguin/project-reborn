---
type: Task
title: The administrator's badges
description: The first administrator's habbo holds and wears the staff badge ADM, and with Habbo Club the club badge HC1 beside it.
scope: [packages/installer, tests/e2e]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

The first administrator looks like staff, and like a club member when it is one.

# Context

- [Spec](/features/installer/spec.md), `### The administrator's badges` under `## Next`.
- [Plan](/features/installer/plan.md), the decision on the administrator's badges.
- `packages/cms/internal/router/club_subscriptions.go`: how a purchase gives `HC1` and wears it.
- `packages/store/queries/avatars.query.sql`: the badge queries and the slots.

# Steps

- [ ] The administrator's transaction gives `ADM` in slot 1.
- [ ] With Habbo Club it gives `HC1` in slot 2; without, no `HC1`.
- [ ] Tests for each behaviour of the spec's section.
- [ ] A browser suite reads the worn badge on the administrator's home or Me page.
- [ ] Update `packages/installer/knowledge/steps.md`, move the spec's lines up into the administrator step's section,
  and note the badges in the plan.

# Checks

```sh
make -C packages/installer check
make e2e
```

Then `make check` in every project that `make dependants project=packages/installer` prints.
