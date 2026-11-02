---
type: Task
title: Add levels to access groups
description: Each group gets a level, group changes follow it, and IP bans skip housekeeping staff.
status: todo
phase: fx
depends_on: [fx-05]
packages: [packages/store, packages/auth, packages/housekeeping]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

Nobody can raise themselves, or reach a group above their level.

# Steps

- [ ] `access_groups.level` and a user's level in `packages/auth`.
- [ ] The field on the group forms, and no level above the editor's own.
- [ ] Refuse to edit a group above the editor's level or add someone to it, with a staff log row.
- [ ] `auth.ActiveBan` skips IP bans for holders of `housekeeping.access`.
- [ ] A helper [HK-B](/phases/hk-b-users-moderation.md) calls for every action on a user.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

# Notes

- None yet.
