---
type: Task
title: Housekeeping and the installer read their settings from the store
description: Housekeeping's and the installer's settings reads and writes go through packages/settings, and neither loads settings at start.
status: todo
slice: platform
depends_on: [platform-06, platform-04]
packages: [packages/housekeeping, packages/installer]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

Housekeeping and the installer hold no copy of the settings ([0006](/decisions/0006-settings-are-read-from-the-store.md)).

# Steps

- [ ] Housekeeping's 14 reads, and its writes on the settings and note pages, go through `packages/settings` with the
  router's queries, or the transaction's inside a transaction. `housekeeping.New` no longer calls `settings.Load`.
- [ ] The installer's 9 reads and its writes in the site step go through `packages/settings`; `internal/setup` no
  longer calls `settings.Load`.
- [ ] The tests of both packages pass unchanged in what they check.

# Verification

```sh
cd packages/housekeeping && go vet ./... && go test ./... -race
cd packages/installer && go vet ./... && go test ./... -race
make e2e
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `platform-08`, after [platform-04](/tasks/platform-04-installer-under-installer.md), which changes
  the installer too.
