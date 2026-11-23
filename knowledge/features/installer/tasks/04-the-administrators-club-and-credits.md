---
type: Task
title: The administrator's club and credits
description: The administrator step offers Habbo Club for 100 years with a ticked box and asks the first credits in a field filled with 5000.
scope: [packages/installer, tests/e2e]
depends_on: [03-the-settings-step]
skills: [applying-go-patterns, templating-astro-pages, testing-behaviours, use-modern-go]
---

# Goal

The first administrator starts with club and with the credits the installer's user chose.

# Context

- [Spec](/features/installer/spec.md), `### The administrator's club and credits` under `## Next`.
- [Plan](/features/installer/plan.md), the two decisions on the administrator's club and credits.
- `packages/installer/knowledge/steps.md`: what the administrator step writes today.
- The club's periods: `packages/store`'s club queries, and how a purchase writes a period
  ([club](/features/club/spec.md)).

# Steps

- [ ] The administrator's page: a tick box "Give this habbo Habbo Club", ticked, and a field "Credits" filled with
  5000, with one line that says the site step's start credits go to habbos who register.
- [ ] The administrator's transaction writes a club period of 100 years from now when the box is ticked, as a
  purchase writes one, with no payment.
- [ ] The purse starts with the credits given, 0 to 1,000,000, and its ledger row keeps the reason `registration` and
  the detail `installer`.
- [ ] Tests for each behaviour of the spec's section.
- [ ] A browser suite ticks nothing, changes the credits, and reads the purse and the club on the site.
- [ ] Update `packages/installer/knowledge/steps.md`, move the spec's lines up, and note the step in the plan.

# Checks

```sh
make -C packages/installer check
make e2e
```

Then `make check` in every project that `make dependants project=packages/installer` prints.
