---
type: Task
title: Build the motto, email, password and referral tabs
description: Port the other four tabs of account.php with Holo's forms, checks and texts.
status: done
phase: p2
depends_on: [p2-04]
packages: [packages/store, packages/auth, packages/cms]
holo: [source/holo/account.php]
timestamp: 2026-11-01T21:19:24+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:58:04+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:19:24+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for the other tabs of `account.php`.

# Steps

- [x] `GET/POST /account/profile`: the motto, up to 32 characters, and the club paragraph.
- [x] `GET/POST /account/email`: the current password and the birth date, then the new address and the newsletter box.
- [x] `GET/POST /account/password`: the same details, then the new password twice. It ends every session, because Holo says
      `You will need to login again.`
- [x] `GET /account/referral`: Holo's text, the link and today's reward.
- [x] Tests, including wrong details on both forms.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then run each form in a real Chromium.

Results (2026-11-01T21:19:24+00:00):

- `sqlc generate` and `make check-docs` pass, and `gofmt`, `go vet` and `go test -race` pass in `packages/store`,
  `packages/auth` and `packages/cms`.
- A script drove the production binary in a real Chromium through 23 checks with no failure, no script error and an empty
  server log: every form, each with its refusals, the motto reaching `/me`, the address and newsletter in the database, the
  referral link, the session ending after a password change, the old password refused and the new one accepted.
- `/register`, which shares the birth date selects now, passed all 66 checks of its suite again.
- The Email page was compared with a render of Holo's own CSS.
- Mutation checks: each of these, applied on purpose, failed a test:
  - the birth date not checked;
  - the password not checked;
  - the address not validated;
  - the confirmation ignored;
  - a profile limit of 33;
  - the newsletter not saved;
  - sessions surviving a change;
  - an open reset surviving a change.

# Notes

- The plan dropped Holo's birth date question, and [0034](/decisions/0034-behaviour-matches-holo.md) brought it back.
- A password change ends every session, the visitor's own included, because Holo says `You will need to login again.` and did
  log the visitor out on the next page. It also ends open reset links.
- Holo's newsletter box on the email form does nothing, so it starts unchecked and is ignored. Here it shows and saves
  `users.newsletter`.
- `This e-mail address already has an account.` is new, because addresses are unique here.
- The referral text keeps Holo's option 2, although no form field exists for it, in Holo or here. Its spelling is fixed.
- The birth date selects moved to `habbo/birth-date.astro`, used by `/register` and both forms.
