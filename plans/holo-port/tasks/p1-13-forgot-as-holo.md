---
type: Task
title: Match the forgot page to Holo
description: Ask for the username and the email as Holo does, send a reset only when both match, and show Holo's page to signed-in visitors.
status: todo
phase: p1
depends_on: [p1-12]
packages: [packages/store, packages/auth, packages/cms]
holo: [source/holo/forgot.php, source/holo/locale/en/login.php]
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for `forgot.php`, keeping [0018](/decisions/0018-password-reset-by-email.md).

# Steps

- [ ] The form asks for `Username` and `Email address`, as plain text fields that keep what was typed.
- [ ] `auth.CreateReset` takes both and acts only when the habbo belongs to the account of that address.
- [ ] Holo's texts, including the intro, and the answer in a white box above the form.
- [ ] The mail reads as Holo's: greets the habbo, names it, and carries the link where Holo put the password.
- [ ] A signed-in visitor sees `Please log out to use this feature.` and a `Back` button, on `GET` and `POST`.
- [ ] Tests, including a name and an address of two different accounts.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

# Notes

- The answer stays the same for every input, because Holo's `Invalid username or e-mail address` would tell a stranger
  whether a name and an address belong together.
