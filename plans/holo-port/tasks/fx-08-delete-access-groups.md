---
type: Task
title: Delete access groups
description: Staff with housekeeping.accessGroups can delete a group, unless that breaks the guard.
status: done
phase: fx
depends_on: [fx-06]
packages: [packages/housekeeping, packages/store]
holo: []
timestamp: 2026-11-02T02:18:18+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T02:18:18+00:00"}
---

# Goal

Access groups are fully customizable.

# Steps

- [x] `POST /housekeeping/access-groups/{id}/delete`, with the guard, the level rule and a staff log row, in one
  transaction.
- [x] A confirmation on the group page.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

Results (2026-11-02T02:18:18+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`, `sqlc generate` ran, and `make check-docs` passes.
- `make e2e` passed all 371 checks, including the box on the group page and the staff log row.
- Five breaks made on purpose were each caught: no box needed, a group above the editor deleted, the guard skipped, no log row,
  and the route without `housekeeping.accessGroups`.

# Notes

- The confirmation is a box the server checks, so it needs no JavaScript.
- The break on the route survived at first, because no test posted to it without the attribute. It is in that test now.
