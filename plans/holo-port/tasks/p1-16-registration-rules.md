---
type: Task
title: Match the registration rules and texts to Holo
description: Port Holo's email, birth date and age rules, its messages and defaults, and keep the live check's own texts apart.
status: todo
phase: p1
depends_on: [p1-11]
packages: [packages/auth, packages/cms]
holo: [source/holo/register.php, source/holo/ajax_namecheck.php, source/holo/ajax_emailcheck.php]
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for what `/register` checks on the server.

# Steps

- [ ] `auth.ValidateEmail` uses Holo's rule, and `auth.ValidateBornOn` Holo's first year, 1920.
- [ ] `auth.ValidatePassword` says whether a password is too short or too long, with Holo's texts.
- [ ] `/register/check-name` answers with the texts of `ajax_namecheck.php`, and the form keeps those of `register.php`.
- [ ] The terms error reads `Please accept the terms of service`.
- [ ] The newsletter box starts checked, with Holo's label, and the terms box reads `I accept the Terms of Service`.
- [ ] Under the age limit of 6, `POST /register` goes to `/?ageLimit=true`, which Holo only checked in the browser.
- [ ] Names and addresses are no longer trimmed.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/installer && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

# Notes

- None yet.
