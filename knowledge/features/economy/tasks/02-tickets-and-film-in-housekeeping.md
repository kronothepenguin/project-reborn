---
type: Task
title: Housekeeping gives and takes tickets and film
description: Housekeeping's habbo page gains forms to give or take tickets and film, with the staff log and the live purse, as it has for credits.
scope: [packages/housekeeping, packages/store, tests/e2e]
depends_on: [01-the-purse-live]
skills: [applying-go-patterns, templating-astro-pages, building-astro-components, testing-behaviours, use-modern-go]
---

# Goal

Staff change every currency of a purse, and the habbo sees it at once.

# Context

- [Spec](/features/economy/spec.md), `### Tickets and film in housekeeping` under `## Next`.
- [Plan](/features/economy/plan.md).
- Housekeeping's form and handler for credits, and its staff log.

# Steps

- [ ] Two forms on the habbo's page, beside credits: "Give or take tickets" and "Give or take film", built as the
  credits form is, under `housekeeping.credits`.
- [ ] Each changes the purse and writes the staff log in one transaction, then calls `SendPurse`.
- [ ] The refusals of the spec, with the credits form's kind of message.
- [ ] Tests for each behaviour; a browser suite's check for each form.
- [ ] Update housekeeping's knowledge and move the spec's lines up.

# Checks

```sh
make -C packages/housekeeping check
make e2e
```

Then `make check` in every project that `make dependants project=packages/housekeeping` prints.
