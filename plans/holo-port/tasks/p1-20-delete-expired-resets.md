---
type: Task
title: Delete expired reset links on a schedule
description: Register a task in cms.New that deletes reset links once they expire, in place of the purge in auth.CreateReset.
status: todo
phase: p1
depends_on: [p0-23]
packages: [packages/auth, packages/store, packages/cms]
holo: []
timestamp: 2026-11-01T19:50:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:50:41+00:00"}
---

# Goal

Implement [0044](/decisions/0044-expired-reset-links-deleted.md).

# Steps

- [ ] `auth.DeleteExpiredResets(ctx, db)`.
- [ ] `auth.CreateReset` no longer purges.
- [ ] `cms.New` runs the deletion every minute.
- [ ] Tests, and the docs of `auth` and `cms`.

# Verification

```sh
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then, on the production binary, an expired link must disappear within a minute and a live one must stay.

# Notes

- None yet.
