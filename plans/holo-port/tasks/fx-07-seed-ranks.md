---
type: Task
title: Seed Holo's ranks in the installer
description: The installer creates Administrator, Moderator, Gold Hobba, Silver Hobba and HabboX as access groups.
status: todo
phase: fx
depends_on: [fx-06]
packages: [packages/installer]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

A new hotel starts with Holo's ranks as editable groups.

# Steps

- [ ] Create the five groups of decision 0054, with their attributes, levels and the `/staff` flag.
- [ ] The first administrator joins Administrator.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

# Notes

- None yet.
