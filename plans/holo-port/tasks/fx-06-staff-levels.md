---
type: Task
title: Add levels to access groups
description: Each group gets a level, group changes follow it, and IP bans skip housekeeping staff.
status: done
phase: fx
depends_on: [fx-05]
packages: [packages/store, packages/auth, packages/housekeeping]
holo: []
timestamp: 2026-11-02T02:10:15+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T02:10:15+00:00"}
---

# Goal

Nobody can raise themselves, or reach a group above their level.

# Steps

- [x] `access_groups.level` and a user's level in `packages/auth`.
- [x] The field on the group forms, and no level above the editor's own.
- [x] Refuse to edit a group above the editor's level or add someone to it, with a staff log row.
- [x] `auth.ActiveBan` skips IP bans for holders of `housekeeping.access`.
- [x] A helper [HK-B](/phases/hk-b-users-moderation.md) calls for every action on a user.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

Results (2026-11-02T02:10:15+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/auth` and `packages/housekeeping`, and the tests of `packages/store`,
  `packages/cms` and `packages/installer` pass, with `make check-docs`.
- `make e2e` passed all 365 checks.
- Twelve breaks made on purpose were each caught:
  - `Outranks` allowing equals;
  - `Level` taking the lowest group;
  - IP bans reaching staff, and staff escaping bans on their own account;
  - a group above the editor changed;
  - a level above the editor's own set on a save, and on a create;
  - a group at the editor's own level refused;
  - levels left unchecked;
  - a change of level alone not saved;
  - members joining a group above the editor;
  - refusals left out of the staff log.

# Notes

- Two of those breaks survived at first, for gaps in the tests: nothing edited a group at the editor's own level, and the test of
  a level change also changed the name. Both are closed.
- `auth.Outranks` has only tests as callers for now. [HK-B](/phases/hk-b-users-moderation.md) calls it for every action on a user.
- Membership follows the level of the group, not of the member, so an administrator can take another administrator out of a
  group, as [0055](/decisions/0055-staff-levels.md) expects.
- An empty subtest name becomes `#00`, and a `#` in a database path ends the file name, so a run wrote to `/tmp` and failed on the
  next. `store.path` already refuses `#`, so only that test was affected, and its subtests have names now.
