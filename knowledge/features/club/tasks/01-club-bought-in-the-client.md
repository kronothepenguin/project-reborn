---
type: Task
title: Club bought in the client
description: The rule of a club purchase moves to packages/virtual/club, the site's club page calls it, and the game answers the client's SCR_BUY with it, the three buttons buying 1, 3 and 6 months.
scope: [packages/virtual, packages/cms, packages/server, tests/e2e]
depends_on: [economy/01-the-purse-live]
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

A habbo buys club from the client's own window, by the site's rules.

# Context

- [Spec](/features/club/spec.md), `### Club bought in the client` under `## Next`, and the built sections on the club
  page, the badge and the days.
- [Plan](/features/club/plan.md), "Buying, shared by the site and the game": the shape is the user's, build it
  exactly as written there.
- `packages/cms/internal/router/club_subscriptions.go`: the rule as the site holds it today.
- `packages/server/knowledge/r26/hh_club.md`: `SCR_BUY`, message 7 and the notices 551 and 552.

# Steps

- [ ] `packages/virtual/club`: `Buy`, `Result` and `Reason`, holding the rule the site's handler holds today.
- [ ] The site's club page calls it, and answers as before.
- [ ] The game answers `SCR_BUY`: buttons 1, 2 and 3 buy 1, 3 and 6 months; on success the client gets its new
  credits and its club's status; a refusal gets the client's own notice.
- [ ] Tests of `Buy` for each rule; the site's tests of the club page pass as they are; tests of the game for each
  behaviour of the spec's section.
- [ ] Update the knowledge of the packages, move the spec's lines up, and the plan's rows.

# Checks

```sh
make -C packages/virtual check
make -C packages/cms check
make -C packages/server check
make e2e
```

Then `make check` in every project that `make dependants project=<folder>` prints for those.
