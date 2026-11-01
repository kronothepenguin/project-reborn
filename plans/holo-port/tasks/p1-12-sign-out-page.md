---
type: Task
title: Show Holo's sign-out and ban pages
description: Replace the redirect after signing out with Holo's confirmation, and end the session of a banned visitor on the next page with the ban message.
status: todo
phase: p1
depends_on: [p1-11]
packages: [packages/components, packages/auth, packages/cms]
holo: [source/holo/logout.php, source/holo/core.php]
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for `logout.php`, in its three states, and for the ban check in `core.php`.

# Steps

- [ ] `Button` can render a link, for Holo's OK button.
- [ ] `logout.astro`: a green notice or a red one, and an OK button to `/`.
- [ ] `POST /logout` with a session shows `You have successfully signed out`.
- [ ] `POST /logout` and `GET /logout` without a session show `You are not logged in`.
- [ ] `GET /logout` with a session goes to `/me`: signing out stays a `POST`, so that another site cannot do it.
- [ ] `auth.ActiveBan`, used by `Login` and by a new `router.Banned`.
- [ ] A banned visitor loses the session on the next page and sees the ban message with the OK button, before the
      maintenance check, as in `core.php`.
- [ ] Tests for every state.

# Verification

```sh
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/cms build
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

# Notes

- None yet.
