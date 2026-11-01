---
type: Task
title: Build the motto, email, password and referral tabs
description: Port the other four tabs of account.php with Holo's forms, checks and texts.
status: todo
phase: p2
depends_on: [p2-04]
packages: [packages/store, packages/auth, packages/cms]
holo: [source/holo/account.php]
timestamp: 2026-11-01T20:58:04+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:58:04+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for the other tabs of `account.php`.

# Steps

- [ ] `GET/POST /account/profile`: the motto, up to 32 characters, and the club paragraph.
- [ ] `GET/POST /account/email`: the current password and the birth date, then the new address and the newsletter box.
- [ ] `GET/POST /account/password`: the same details, then the new password twice. It ends every session, because Holo says
      `You will need to login again.`
- [ ] `GET /account/referral`: Holo's text, the link and today's reward.
- [ ] Tests, including wrong details on both forms.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then run each form in a real Chromium.

# Notes

- None yet.
