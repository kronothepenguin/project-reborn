---
type: Task
title: The services package, the Habbos contract and Inject
description: packages/services holds the first contract, Habbos.SendLook(ctx, avatarID), and the CMS and housekeeping take their services through Inject.
scope: [packages/services, packages/cms, packages/housekeeping, go.work]
depends_on: []
skills: []
---

# Goal

The contract every side of the habbos feature builds on
([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)). It runs alone.

# Context

- [Spec](/features/habbos/spec.md)
- [Plan](/features/habbos/plan.md)
- [The game hears of live changes through
  services](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)
- Runs alone: it touches `go.work` and the go.mod files of the CMS and housekeeping.

# Steps

- [ ] A new module `packages/services` (`go work use`), importing only the standard library:

  ```go
  // Habbos tells the game server that a habbo changed outside the game.
  type Habbos interface {
      // SendLook shows the habbo's saved figure, gender and motto to it and its room.
      SendLook(ctx context.Context, avatarID int64) error
  }
  ```

- [ ] The CMS and housekeeping each gain `type Services struct { Habbos services.Habbos }` and
  `Inject(s Services)`, called once after `New` and before `Mount`; their routers receive the services.
- [ ] Until a runner injects them, a service is absent and an app skips its calls: the change is saved, as when a call
  fails.
- [ ] A short `packages/services/README.md` (what it is, setup), and in `packages/services/knowledge/`: what a service
  is (only what the game must show live), the order constructors, services, `Inject`, run, ids only, nothing stored.
- [ ] Tests: `Inject` hands the service to the router; nothing is called yet.

# Checks

```sh
make -C packages/services check
make -C packages/cms check
make -C packages/housekeeping check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/services`,
`packages/cms`, `packages/housekeeping`.
