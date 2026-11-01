---
type: Task
title: Write the staff log helper and page
description: One helper writes a staff_logs row for every mutation, and GET /logs reads them with housekeeping.logs.
status: done
phase: hk-a
depends_on: [hk-a-04]
packages: [packages/housekeeping, packages/store]
holo: [source/holo/housekeeping/logs.php]
timestamp: 2026-11-01T21:30:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:30:17+00:00"}
---

# Goal

Everything staff change leaves a row, and staff with `housekeeping.logs` read them.

# Steps

- [x] `CreateStaffLog`, `CountStaffLogs` and `ListStaffLogs` in `packages/store`, with their documentation.
- [x] The action list in `packages/store/knowledge/entities/staff-log.md`.
- [x] The one helper in `packages/housekeeping`, which works inside a transaction or outside one.
- [x] `GET /logs`, read-only, newest first, in pages.
- [x] Tests: attribute, order, paging, deleted actors and targets, escaping.

# Verification

```sh
cd packages/store && go tool sqlc generate && git diff --exit-code -- db.go models.go '*.query.sql.go' && make check-docs
cd packages/store && gofmt -l . && go vet ./... && go test ./... -race
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-11-01):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` (43 tests) and `packages/housekeeping` (18), `sqlc generate`
  changes nothing and `make check-docs` passes.
- Six breaks, one at a time, were each caught by a named test: no attribute on the route, `RequireAttribute` letting
  everyone through, the oldest row first, and pages past the end, below one, and rows without a user.
- The break below one survived at first. SQLite treats a negative `OFFSET` as 0, so `?page=0` showed the right rows with a
  wrong pager, and the test only counted rows. The test now reads the pager too.

# Notes

- Holo's `Prune Logs` is not ported: the phase makes the page read-only, and the entity says rows are never deleted.
- Because of that the table only grows, so the page shows 100 rows at a time, where Holo listed them all.
- The queries have a file of their own, not `moderation.query.sql`, so that P2's work on alerts cannot collide with them
  while both branches are open.
- `writeLog` has no caller yet. The first mutation, the note of [hk-a-06](/tasks/hk-a-06-dashboard.md), tests it.
