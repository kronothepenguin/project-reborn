---
type: Task
title: Delete access groups
description: Staff with housekeeping.accessGroups can delete a group, unless that breaks the guard.
status: todo
phase: fx
depends_on: [fx-06]
packages: [packages/housekeeping, packages/store]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

Access groups are fully customizable.

# Steps

- [ ] `POST /housekeeping/access-groups/{id}/delete`, with the guard, the level rule and a staff log row, in one
  transaction.
- [ ] A confirmation on the group page.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

# Notes

- None yet.
