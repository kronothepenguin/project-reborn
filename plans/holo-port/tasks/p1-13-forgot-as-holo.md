---
type: Task
title: Match the forgot page to Holo
description: Ask for the username and the email as Holo does, send a reset only when both match, and show Holo's page to signed-in visitors.
status: done
phase: p1
depends_on: [p1-12]
packages: [packages/store, packages/auth, packages/cms]
holo: [source/holo/forgot.php, source/holo/locale/en/login.php]
timestamp: 2026-11-01T18:30:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:30:37+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for `forgot.php`, keeping [0018](/decisions/0018-password-reset-by-email.md).

# Steps

- [x] The form asks for `Username` and `Email address`, as plain text fields that keep what was typed.
- [x] `auth.CreateReset` takes both and acts only when the habbo belongs to the account of that address.
- [x] Holo's texts, including the intro, and the answer in a white box above the form.
- [x] The mail reads as Holo's: greets the habbo, names it, and carries the link where Holo put the password.
- [x] A signed-in visitor sees `Please log out to use this feature.` and a `Back` button, on `GET` and `POST`.
- [x] Tests, including a name and an address of two different accounts.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-11-01T18:30:37+00:00):

- The CMS builds, and `forgot.html` keeps its placeholders.
- `sqlc generate` and `make check-docs` pass, and `gofmt`, `go vet` and `go test -race` pass in `packages/store`,
  `packages/auth` and `packages/cms`.
- Tests cover a name and an address of two accounts, the stored spelling of both, the same answer for every pair, what the
  form keeps, and a signed-in visitor on `GET` and `POST`.
- Mutation checks: each of these, applied on purpose, failed a test:
  - a signed-in visitor can still request a reset;
  - the page does not say the visitor is signed in;
  - the mail greets the typed name instead of the stored one;
  - the mail goes to the typed address;
  - the form forgets what was typed;
  - the query matches the name or the address instead of both.

# Notes

- The answer stays the same for every input, because Holo's `Invalid username or e-mail address` would tell a stranger
  whether a name and an address belong together.
- The answer is the one sentence `If this username and e-mail address match, an e-mail is on its way. Check your inbox
  and spam folders.` Holo's `E-Mail send!` would be false for a wrong pair, and `Invalid username or e-mail address` would
  tell a stranger that a pair is wrong.
- The mail keeps Holo's text and layout, and `Password:` carries the link, because the port cannot mail a password.
- The goroutine of a request can outlive a test, so a test's log can show `sql: database is closed`. It fails nothing.
