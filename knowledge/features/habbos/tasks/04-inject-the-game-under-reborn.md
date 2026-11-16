---
type: Task
title: Inject the game into the site and housekeeping under reborn
description: reborn's runner hands the game server, which satisfies services.Habbos, to the CMS and housekeeping through Inject, so a look saved on the site reaches the game in the same process.
scope: [apps/reborn, packages/reborn]
depends_on: [platform/17-hand-reborn-the-programs]
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

Under reborn, a look saved on the site reaches the game in the same process
([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)). The behaviour of the spec:

- Under reborn, a look or motto saved on the site or in housekeeping reaches the game in the same process.

# Context

- [Spec](/features/habbos/spec.md)
- [Plan](/features/habbos/plan.md)
- [Platform plan](/features/platform/plan.md): reborn runs the programs its runner builds.
- [The game hears of live changes through
  services](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)
- `*server.Server` satisfies `services.Habbos`: its `SendLook` returns nil for an unknown or offline habbo, and an
  error only when the store fails.
- `Inject` runs before `Mount` on the CMS and housekeeping: `Mount` hands the router the services held at that moment.

# Steps

- [ ] `apps/reborn/cmd/reborn/main.go`, after it builds the programs and before `reborn.New`:
  `c.Inject(cms.Services{Habbos: g})` and `h.Inject(housekeeping.Services{Habbos: g})`.
- [ ] One test of the behaviour in `packages/reborn`, with the programs built and injected as the runner does, on free
  ports: a habbo logged in through the game's test client in a room sees its new look after the CMS's looks page
  saves it, and its new motto after housekeeping saves it.
- [ ] Update `packages/reborn/knowledge`.

# Checks

```sh
make -C packages/reborn check
make -C apps/reborn check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/reborn`, `apps/reborn`.
