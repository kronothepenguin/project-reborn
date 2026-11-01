---
type: Task
title: Match the registration rules and texts to Holo
description: Port Holo's email, birth date and age rules, its messages and defaults, and keep the live check's own texts apart.
status: done
phase: p1
depends_on: [p1-11]
packages: [packages/auth, packages/cms]
holo: [source/holo/register.php, source/holo/ajax_namecheck.php, source/holo/ajax_emailcheck.php]
timestamp: 2026-11-01T18:40:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:40:14+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for what `/register` checks on the server.

# Steps

- [x] `auth.ValidateEmail` uses Holo's rule, and `auth.ValidateBornOn` Holo's first year, 1920.
- [x] `auth.ValidatePassword` says whether a password is too short or too long, with Holo's texts.
- [x] `/register/check-name` answers with the texts of `ajax_namecheck.php`, and the form keeps those of `register.php`.
- [x] The terms error reads `Please accept the terms of service`.
- [x] The newsletter box starts checked, with Holo's label, and the terms box reads `I accept the Terms of Service`.
- [x] Under the age limit of 6, `POST /register` goes to `/?ageLimit=true`, which Holo only checked in the browser.
- [x] Names and addresses are no longer trimmed.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/installer && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-11-01T18:40:14+00:00):

- The CMS builds, and `gofmt`, `go vet` and `go test -race` pass in `packages/auth`, `packages/installer` and
  `packages/cms`.
- Mutation checks: each of these, applied on purpose, failed a test:
  - no age limit on the server;
  - an age that ignores the birthday;
  - an age limit of 7;
  - the newsletter starting unchecked;
  - the live check using the form's texts, and the form using the live check's;
  - a long password reading as too short;
  - 1900 as the first valid birth year;
  - `+` allowed in an address.

# Notes

- `auth.ValidateEmail` is now Holo's regular expression, so `a+b@example.com` and top-level domains over 7 letters are
  refused, as in Holo. The installer uses the same rule.
- Holo's year list runs to 1900 while its rule refuses years before 1920, and the port keeps both.
- `Please read and accept the Terms of Service to register.` is the text Holo sets, but its page prints `Please accept the
  terms of service`, so the port uses the second.
- Holo's `Passwords may be no longer than 25 characters` is in its locale, unused, because Holo's check is commented out.
  The port keeps `auth.passwordMaxLength`, so it uses that text with the setting's value.
