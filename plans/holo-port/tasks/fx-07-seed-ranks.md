---
type: Task
title: Seed Holo's ranks in the installer
description: The installer creates Administrator, Moderator, Gold Hobba, Silver Hobba and HabboX as access groups.
status: done
phase: fx
depends_on: [fx-06]
packages: [packages/installer]
holo: []
timestamp: 2026-11-02T02:13:58+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T02:13:58+00:00"}
---

# Goal

A new hotel starts with Holo's ranks as editable groups.

# Steps

- [x] Create the five groups of decision 0054, with their attributes, levels and the `/staff` flag.
- [x] The first administrator joins Administrator.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

Results (2026-11-02T02:13:58+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/installer`, and `TestCreateAdministratorSeedsHolosRanks` checks the five
  groups against [0054](/decisions/0054-access-groups-are-holos-ranks.md).
- `make e2e` passed all 365 checks, on a hotel with the five groups.
- Two breaks made on purpose were each caught: the first administrator outside Administrator, and the Moderator holding
  `housekeeping.settings`.

# Notes

- None.
