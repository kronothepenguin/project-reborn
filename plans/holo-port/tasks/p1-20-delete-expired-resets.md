---
type: Task
title: Delete expired reset links on a schedule
description: Register a task in cms.New that deletes reset links once they expire, in place of the purge in auth.CreateReset.
status: done
phase: p1
depends_on: [p0-23]
packages: [packages/auth, packages/store, packages/cms]
holo: []
timestamp: 2026-11-01T20:02:22+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:50:41+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:02:22+00:00"}
---

# Goal

Implement [0044](/decisions/0044-expired-reset-links-deleted.md).

# Steps

- [x] `auth.DeleteExpiredResets(ctx, db)`.
- [x] `auth.CreateReset` no longer purges.
- [x] `cms.New` runs the deletion every minute.
- [x] Tests, and the docs of `auth` and `cms`.

# Verification

```sh
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then, on the production binary, an expired link must disappear within a minute and a live one must stay.

Results (2026-11-01T20:02:22+00:00):

- On the production binary, an expired link was gone 60 seconds after it was written, at the task's first run, a live one
  stayed, and the log stayed free of errors.
- From a clean worktree of this tree: `make install` and a build with no frontend passed, `gofmt`, `go vet` and
  `go test -race` pass in all eleven Go modules, with 326 tests, 116 component tests and `svelte-check` pass, `sqlc generate`
  changes nothing and `make check-docs` passes.
- All three browser suites of [p1-18](/tasks/p1-18-exit-check-as-holo.md) passed again: 65, 66 and 10 checks, with empty
  server logs.

# Notes

- The task runs every minute, so a link goes within a minute of expiring. It stops working at the exact moment regardless,
  because `GetActivePasswordReset` compares `expires_at`, and it stops counting against the limit at that moment too.
- `apps/cms/.air.toml` watches `packages/scheduler` now.
