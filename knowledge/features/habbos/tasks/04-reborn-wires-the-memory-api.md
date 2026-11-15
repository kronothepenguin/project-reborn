---
type: Task
title: reborn passes the game to the site and housekeeping
description: packages/reborn builds the memory API around the game's instance and injects it into the CMS and housekeeping, in the order constructors, services, Inject, run.
scope: [packages/reborn]
depends_on: [02-the-game-sends-a-new-look, 03-the-site-tells-the-game, platform/03-reborn-runs-an-installed-hotel]
skills: []
---

# Goal

Under reborn, a look saved on the site reaches the game in the same process
([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)).

# Context

- [Spec](/features/habbos/spec.md)
- [Plan](/features/habbos/plan.md)
- [The game hears of live changes through
  services](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)
- If [platform 05](/features/platform/tasks/05-reborn-installs-a-new-hotel.md) is merged first, the hotel built after
  an install is injected the same way.
- `Inject` runs before `Mount` on the CMS and housekeeping: `Mount` hands the router the services held at that moment.

# Steps

- [ ] The memory API in `packages/reborn`: it holds the game's `*server.Server` and implements `services.Habbos` by
  calling its `SendLook`.
- [ ] `Run` builds the CMS, housekeeping and the game, then the memory API, then calls `Inject` on the CMS and
  housekeeping, then mounts and starts them.
- [ ] Tests: under reborn on free ports, a habbo logged in through the game's test client in a room sees its new look
  after the CMS's looks page saves it, and its new motto after housekeeping saves it.

# Checks

```sh
make -C packages/reborn check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/reborn`.
