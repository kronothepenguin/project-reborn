---
type: Task
title: Build the Settings entity in packages/virtual
description: Create the packages/virtual module with a type-safe Settings wrapper that merges settings rows over config and receives the database.
status: todo
phase: p0
depends_on: [p0-06, p0-07]
packages: [packages/virtual]
holo: []
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
---

# Goal

Implement [0010](/decisions/0010-virtual-settings-entity.md).

# Steps

- [ ] `mkdir packages/virtual && cd packages/virtual && go mod init github.com/kronothepenguin/project-reborn/packages/virtual`,
      then `go work use ./packages/virtual` from the repository root.
- [ ] `LoadSettings(ctx, cfg, db)`, `Config()`, `Base()`, `Update(ctx, db, userID, fn)`, `Reload(ctx, db)`.
- [ ] Merge through JSON key paths; invalid and undeclared rows skipped and logged with `slog`.
- [ ] `Update` validates, writes only changed paths in one transaction, deletes rows equal to `Base()` and refuses
      `store.path`, `cms.port` and `housekeeping.port`.
- [ ] Tests (temporary directory with `config.json` and a temporary database): override, deleted row, invalid row,
      undeclared key, only changed keys written, revert by equal value, startup-only refusal, `Reload`.

# Verification

```sh
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
```

# Notes
