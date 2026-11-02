---
type: Task
title: Archive habbos
description: A user archives a habbo from /account/habbos, which hides it and frees a slot, and its name stays reserved.
status: done
phase: fx
depends_on: [fx-04]
packages: [packages/store, packages/auth, packages/cms]
holo: []
timestamp: 2026-11-02T02:54:56+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T02:54:56+00:00"}
---

# Goal

A user can retire a habbo, and nothing about it is lost.

# Steps

- [x] `avatars.archived_at`, and a filter on the queries that read habbos.
- [x] `POST /account/habbos/{id}/archive`, with the password.
- [x] Refuse the active habbo, and a habbo that owns a group.
- [x] An archived habbo cannot sign in, and it leaves the limit, the lists and the promo.
- [x] Its name stays reserved.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

Results (2026-11-02T02:54:56+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store`, `packages/auth`, `packages/cms`, `packages/housekeeping` and
  `packages/installer`, and `make check-docs` passes.
- `make e2e` passed all 389 checks. In a real browser, a wrong password was refused, the habbo left the list and could not sign
  in, its row stayed, its sibling signed in, and its name stayed taken.
- Eleven breaks made on purpose were each caught: the active habbo archived, a habbo owning a group archived, sessions left on the
  archived habbo, no password needed, a referral paid to it, it as a display habbo, and the filters on the list, the count, the
  sign-in and the switch.

# Notes

- `GetAvatarByName` still sees archived habbos, because the check of a free name needs them.
- Sessions open on the habbo in another browser move to the habbo that archived it. [0058](/decisions/0058-habbos-are-archived.md)
  did not name this case, and leaving them there would strand them on a hidden habbo.
- Staff lists read names from live habbos, and the staff log keeps the old ones.
- Restoring comes with [HK-B](/phases/hk-b-users-moderation.md), the stickers with [P3](/phases/p3-homes.md) and the `disabled`
  label with [P5](/phases/p5-groups-forum.md).
