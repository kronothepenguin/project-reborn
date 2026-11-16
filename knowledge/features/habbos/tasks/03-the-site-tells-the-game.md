---
type: Task
title: Tell the game of a new look or motto from the site and housekeeping
description: The CMS's looks, profile and motto pages and housekeeping's habbo editor call Habbos.SendLook after they save, give up after 2 seconds and log a failure.
scope: [packages/cms, packages/housekeeping]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

Every place that changes a habbo's look or motto tells the game
([0013](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)). The behaviours of the spec:

- A habbo saves a look on the looks page, or a motto on the Me page or the profile page: the site tells the game once,
  after the save.
- Staff save a habbo's look or motto in housekeeping: housekeeping tells the game once, after the save.
- A save is refused: the game is told nothing.
- The game fails, or gives no answer within 2 seconds: the page answers as it does today, and the failure is logged.

# Context

- [Spec](/features/habbos/spec.md)
- [Plan](/features/habbos/plan.md)
- `packages/services/knowledge/index.md`: the contract `services.Habbos` and the rules of a service.
- `packages/cms/knowledge/runtime.md` and `packages/housekeeping/knowledge/package.md`: `Inject`.
- [A habbo's look and motto reach the game at once, from wherever they
  change](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)
- An app reads its injected service as `router.Deps.Habbos`. It is nil until a runner injects it. The router calls it
  after the save and skips the call when it is nil.
- Each router logs through its `logError`, which leaves an abandoned request out of the log.

# Steps

- [ ] After the save of `UpdateAvatarLook` or `UpdateAvatarMotto`, call `Habbos.SendLook(ctx, avatarID)`: the CMS's
  `account_looks.go`, `account_profile.go` and `me_motto.go`, and housekeeping's `habbos.go`.
- [ ] The call comes after the commit, with a context of its own of 2 seconds, apart from the request's, so a request
  the visitor abandons still tells the game. An error is logged, and the page answers as it does today
  ([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)).
- [ ] One test per behaviour of the goal, through each router, with a recording `services.Habbos`.
- [ ] Update `packages/cms/knowledge` and `packages/housekeeping/knowledge` where they describe these saves.

# Checks

```sh
make -C packages/cms check
make -C packages/housekeeping check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/cms`,
`packages/housekeeping`.
