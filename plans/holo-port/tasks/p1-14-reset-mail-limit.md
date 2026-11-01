---
type: Task
title: Limit the reset mail
description: Send no reset mail while the account holds auth.resetMaxActive unexpired links, in one atomic insert.
status: done
phase: p1
depends_on: [p1-13]
packages: [packages/virtual, packages/store, packages/auth]
holo: []
timestamp: 2026-11-01T18:33:20+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:33:20+00:00"}
---

# Goal

Implement [0035](/decisions/0035-reset-mail-limit.md).

# Steps

- [x] Declare `auth.resetMaxActive`, 3 by default.
- [x] The insert of a reset counts the account's unexpired links in the same statement, so that requests at the same
      moment cannot pass the limit together.
- [x] `auth.CreateReset` returns no reset at the limit, and the page answers the same way.
- [x] Tests: the limit, a link expiring, and many requests at once.

# Verification

```sh
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-11-01T18:33:20+00:00):

- `sqlc generate` and `make check-docs` pass, and `gofmt`, `go vet` and `go test -race` pass in `packages/store`,
  `packages/virtual`, `packages/auth` and `packages/cms`.
- Tests cover the limit in the store, in `auth` and through `POST /forgot`, a link expiring, another account, and 20 requests
  at once, which stored exactly 3 links.
- Mutation checks: each of these, applied on purpose, failed a test:
  - no limit in the insert;
  - expired links counting against it, caught by the store test because `CreateReset` purges them first;
  - one limit shared by every user;
  - a mail going out at the limit.

# Notes

- One `INSERT … SELECT … WHERE` counts and inserts, so no transaction is needed and requests at the same moment cannot pass
  the limit together.
- `auth.resetMaxActive` allows 1 to 100 and defaults to 3, so at most 3 mails go out in `auth.resetTokenMinutes`.
