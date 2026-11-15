---
type: Task
title: The site and housekeeping tell the game of a new look or motto
description: The CMS's looks, profile and motto pages and housekeeping's habbo editor call Habbos.SendLook after they commit, give up after 2 seconds and log a failure.
scope: [packages/cms, packages/housekeeping]
depends_on: [01-services-and-inject]
skills: []
---

# Goal

Every place that changes a habbo's look or motto tells the game
([0013](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)).

# Context

- [Spec](/features/habbos/spec.md)
- [Plan](/features/habbos/plan.md)
- [A habbo's look and motto reach the game at once, from wherever they
  change](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)
- An app reads its injected service as `router.Deps.Habbos`. It is nil until a runner injects it. The router calls it
  after the save and skips the call when it is nil.

# Steps

- [ ] After the commit of `UpdateAvatarLook` or `UpdateAvatarMotto`, call `Habbos.SendLook(ctx, avatarID)`: the CMS's
  `account-looks.go`, `account-profile.go` and `me.go`, and housekeeping's `habbos.go`.
- [ ] The call has its own context of 2 seconds; an error is logged and the page answers as it does today
  ([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)). Never inside the transaction.
- [ ] Tests with a recording `services.Habbos`: each page calls it once with the habbo's id after saving, and not when
  the save is refused; a failing service still answers the page.

# Checks

```sh
make -C packages/cms check
make -C packages/housekeeping check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/cms`,
`packages/housekeeping`.
