---
type: Task
title: The game reads settings from the store and checks for waiting updates on use
description: The game server reads each setting through packages/settings, loads what it caches the first time no database update waits when a player needs it, refreshes nothing, and virtual/settings and cms.refresh are gone.
scope: [packages/server, packages/virtual, packages/settings]
depends_on: [07-cms-reads-settings, 08-housekeeping-installer-read-settings]
skills: []
---

# Goal

Nothing polls in any program, and settings live only in the store
([0006](/decisions/reborn/0006-settings-are-read-from-the-store.md)).

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- [Every program reads settings from the store, and nothing
  refreshes](/decisions/reborn/0006-settings-are-read-from-the-store.md)
- Supersedes the refresh of [server 0050](/decisions/server/0050-the-server-loads-and-reloads-the-settings.md) and the
  check of [server 0064](/decisions/server/0064-the-navigator-loads-once-the-updates-are-applied.md), as
  [reborn 0006](/decisions/reborn/0006-settings-are-read-from-the-store.md) says.
- The update that removes `cms.refresh`'s row touches `packages/store/migrations`, which no other task may change at
  the same time.

# Steps

- [ ] First, a benchmark of the game's chat handling, its busiest settings reader, through the fake session of the
  `r26` tests: record it in the report.
- [ ] The game's 43 settings reads go through `packages/settings`, with the transaction's queries inside a transaction.
- [ ] `server.New` no longer loads settings nor schedules the reload. The navigator's categories, models and public
  rooms, the furni definitions and the catalogue load at start when no update waits; otherwise the first login, or the
  first request for the navigator or the catalogue, after none waits loads them once (`store.UpdateCheck.Waiting`
  remembers once the database is current). The server never stops for waiting updates.
- [ ] `packages/virtual/settings` is deleted, and `cms.refresh` leaves the list of settings; an update removes its row.
- [ ] The benchmark again; both results in the report.

# Checks

```sh
cd packages/server && go vet ./... && go test ./... -race
cd packages/settings && go vet ./... && go test ./... -race
cd packages/virtual && go vet ./... && go test ./... -race
make gates
```
