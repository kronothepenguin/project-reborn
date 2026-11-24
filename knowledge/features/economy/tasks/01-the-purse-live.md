---
type: Task
title: The game shows a changed purse at once
description: A new Economy service with SendPurse reaches the game in reborn's process and over its /api/, and every place of the site and of housekeeping that changes a purse calls it.
scope: [packages/services, packages/server, packages/cms, packages/housekeeping, packages/reborn, apps/cms, apps/housekeeping, tests/e2e]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

A habbo in the hotel sees its credits change the moment the site or housekeeping changes them.

# Context

- [Spec](/features/economy/spec.md), `### The purse, live` under `## Next`.
- [Plan](/features/economy/plan.md), "The purse's service": the shape is the user's, build it exactly as written
  there.
- How the look's call is built, end to end: `services.Habbos.SendLook`, the game's method, the `/api/` route,
  `packages/server/api`, and the calls in the site and housekeeping ([habbos](/features/habbos/plan.md)).
- The client's messages for credits, tickets and film: `packages/server/knowledge/r26`.

# Steps

- [ ] `services.Economy` with `SendPurse`; the game implements it; the route `POST /api/users/{id}/purse`;
  `packages/server/api` calls it for the programs run apart.
- [ ] `cms.Services` and `housekeeping.Services` gain `Economy`, and reborn and the two runners inject it.
- [ ] Every place that changes a purse calls it once, after its transaction commits: list them in the report.
- [ ] Tests: a habbo in the hotel gets its new credits after each kind of change; a user with no habbo in the hotel
  gets nothing; a game that fails leaves the purse changed and the page as without the game.
- [ ] A browser suite's check: a voucher redeemed on the site reaches a habbo in the hotel.
- [ ] Update the knowledge of the packages, move the spec's lines up, and the plan's rows.

# Checks

```sh
make -C packages/services check
make -C packages/server check
make -C packages/cms check
make -C packages/housekeeping check
make -C packages/reborn check
make e2e
```

Then `make check` in every project that `make dependants project=<folder>` prints for those.
