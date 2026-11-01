---
type: Task
title: Show Holo's sign-out and ban pages
description: Replace the redirect after signing out with Holo's confirmation, and end the session of a banned visitor on the next page with the ban message.
status: done
phase: p1
depends_on: [p1-11]
packages: [packages/components, packages/auth, packages/cms]
holo: [source/holo/logout.php, source/holo/core.php]
timestamp: 2026-11-01T18:27:15+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:27:15+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for `logout.php`, in its three states, and for the ban check in `core.php`.

# Steps

- [x] `Button` can render a link, for Holo's OK button.
- [x] `logout.astro`: a green notice or a red one, and an OK button to `/`.
- [x] `POST /logout` with a session shows `You have successfully signed out`.
- [x] `POST /logout` and `GET /logout` without a session show `You are not logged in`.
- [x] `GET /logout` with a session goes to `/me`: signing out stays a `POST`, so that another site cannot do it.
- [x] `auth.ActiveBan`, used by `Login` and by a new `router.Banned`.
- [x] A banned visitor loses the session on the next page and sees the ban message with the OK button, before the
      maintenance check, as in `core.php`.
- [x] Tests for every state.

# Verification

```sh
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/cms build
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-11-01T18:27:15+00:00):

- 113 component tests pass, the CMS builds, and `logout.html` keeps its placeholders.
- `gofmt`, `go vet` and `go test -race` pass in `packages/auth` and `packages/cms`.
- Mutation checks: each of these, applied on purpose, failed a test:
  - no ban check on the pages;
  - the maintenance check before the ban check;
  - a ban that keeps the session;
  - signing out on a `GET`;
  - no ban check on `POST /logout`;
  - telling a guest they signed out.

# Notes

- Holo's `GET logout.php` signs out. Here only `POST /logout` does, and `GET /logout` sends a signed-in visitor to `/me`.
- The ban page answers 403 where Holo answered 200. A browser shows the same page.
