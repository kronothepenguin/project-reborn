---
type: Task
title: Keep the session on a password change
description: A password change keeps the session of the user who made it, with a new token, and ends the others.
status: done
phase: fx
depends_on: []
packages: [packages/auth, packages/cms]
holo: []
timestamp: 2026-11-02T02:33:16+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T02:33:16+00:00"}
---

# Goal

Changing a password does not sign its owner out, and every other session ends.

# Steps

- [x] `auth.ChangePassword` keeps the current session under a new token.
- [x] The form drops `You will need to login again.`.
- [x] Update `plans/holo-port/reference/holo-differences.md`.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

Results (2026-11-02T02:33:16+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/auth` and `packages/cms`.
- `make e2e` passed all 372 checks. In a real browser, the visitor stayed signed in after the change and another session of the
  same user ended.
- Four breaks made on purpose were each caught: the old token surviving, no new cookie, reset links surviving, and remember-me
  being lost.

# Notes

- None.
