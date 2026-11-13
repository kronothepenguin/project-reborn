---
type: Task
title: The site and housekeeping tell the game of a new look or motto
description: The CMS's looks, profile and motto pages and housekeeping's habbo editor call Habbos.SendLook after they commit, give up after 2 seconds and log a failure.
status: todo
slice: habbos
depends_on: [habbos-01]
packages: [packages/cms, packages/housekeeping]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

Every place that changes a habbo's look or motto tells the game
([0013](/decisions/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)).

# Steps

- [ ] After the commit of `UpdateAvatarLook` or `UpdateAvatarMotto`, call `Habbos.SendLook(ctx, avatarID)`: the CMS's
  `account-looks.go`, `account-profile.go` and `me.go`, and housekeeping's `habbos.go`.
- [ ] The call has its own context of 2 seconds; an error is logged and the page answers as it does today
  ([0005](/decisions/0005-the-game-hears-live-changes-through-services.md)). Never inside the transaction.
- [ ] Tests with a recording `services.Habbos`: each page calls it once with the habbo's id after saving, and not when
  the save is refused; a failing service still answers the page.

# Verification

```sh
cd packages/cms && go vet ./... && go test ./... -race
cd packages/housekeeping && go vet ./... && go test ./... -race
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `habbos-03`.
