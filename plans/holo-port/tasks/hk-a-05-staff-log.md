---
type: Task
title: Write the staff log helper and page
description: One helper writes a staff_logs row for every mutation, and GET /logs reads them with housekeeping.logs.
status: todo
phase: hk-a
depends_on: [hk-a-04]
packages: [packages/housekeeping, packages/store]
holo: [source/holo/housekeeping/logs.php]
timestamp: 2026-11-01T21:07:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
---

# Goal

Everything staff change leaves a row, and staff with `housekeeping.logs` read them.

# Steps

- [ ] `CreateStaffLog`, `CountStaffLogs` and `ListStaffLogs` in `packages/store`, with their documentation.
- [ ] The action list in `packages/store/knowledge/entities/staff-log.md`.
- [ ] The one helper in `packages/housekeeping`, which works inside a transaction or outside one.
- [ ] `GET /logs`, read-only, newest first, in pages.
- [ ] Tests: attribute, order, paging, deleted actors and targets, escaping.

# Verification

```sh
cd packages/store && go tool sqlc generate && git diff --exit-code -- db.go models.go '*.query.sql.go' && make check-docs
cd packages/store && gofmt -l . && go vet ./... && go test ./... -race
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

# Notes

- Holo's `Prune Logs` is not ported: the phase makes the page read-only, and the entity says rows are never deleted.
