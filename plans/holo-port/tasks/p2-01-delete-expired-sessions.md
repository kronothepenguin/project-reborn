---
type: Task
title: Delete expired sessions on a schedule
description: Register a task in cms.New that deletes sessions once they expire, in place of the purge at sign-in.
status: todo
phase: p2
depends_on: []
packages: [packages/auth, packages/cms]
holo: []
timestamp: 2026-11-01T20:49:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:49:31+00:00"}
---

# Goal

Implement [0050](/decisions/0050-expired-sessions-deleted.md).

# Steps

- [ ] `auth.DeleteExpiredSessions(ctx, db)`.
- [ ] Signing in no longer purges.
- [ ] `cms.New` runs the deletion every minute.
- [ ] Tests, and the docs of `auth` and `cms`.

# Verification

```sh
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then, on the production binary, an expired session must disappear within a minute and a live one must stay.

# Notes

- None yet.
