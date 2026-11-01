---
type: Task
title: Limit the reset mail
description: Send no reset mail while the account holds auth.resetMaxActive unexpired links, in one atomic insert.
status: todo
phase: p1
depends_on: [p1-13]
packages: [packages/virtual, packages/store, packages/auth]
holo: []
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
---

# Goal

Implement [0035](/decisions/0035-reset-mail-limit.md).

# Steps

- [ ] Declare `auth.resetMaxActive`, 3 by default.
- [ ] The insert of a reset counts the account's unexpired links in the same statement, so that requests at the same
      moment cannot pass the limit together.
- [ ] `auth.CreateReset` returns no reset at the limit, and the page answers the same way.
- [ ] Tests: the limit, a link expiring, and many requests at once.

# Verification

```sh
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

# Notes

- None yet.
