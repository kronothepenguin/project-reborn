---
type: Task
title: Build registration
description: Make /register create an account with the avatar editor, the live name check and the per-IP limit, then sign the visitor in.
status: todo
phase: p1
depends_on: [p1-01, p1-02, p1-03]
packages: [packages/auth, packages/virtual, packages/cms]
holo: [source/holo/register.php, source/holo/ajax_namecheck.php, source/holo/ajax_emailcheck.php, source/holo/ajax_password.php, source/holo/web-gallery/static/js/registration.js]
timestamp: 2026-10-30T21:10:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
---

# Goal

A visitor creates an account with a habbo and is signed in on `/me`.

# Steps

- [ ] Declare `registration.maxPerIp` (default 5), `registration.ipWindowHours` (default 24),
      `registration.defaultFigure` (the installer's figure) and `registration.defaultGender` (`M`).
- [ ] `ValidateFigure` in `packages/auth` for the dot format, including an empty colour such as `ha-1001-`.
- [ ] `register.astro`: finish the form with `method="post"`, the inputs that are missing their names (the
      password confirmation and both email fields, which are also typed `password`), the birth-date `Select`s, the
      `Checkbox`es, a `Notice` per section and the entered values kept after an error. The order of the sections
      stays.
- [ ] ⚡`register/name-check`: wraps the name input and the `Icon` button and calls `POST /register/check-name`.
- [ ] ⚡`habbo/avatar-editor`: moves the inline script into an island that wraps `public/habbo-editor.iife.js` and
      fills the hidden `figure` and `gender` inputs. P2's look editor reuses it.
- [ ] `POST /register/check-name` (`internal/router/register-check-name.go`): answers JSON with Holo's texts for a
      taken, invalid, too long or empty name.
- [ ] `GET /register` with a session redirects to `/me`.
- [ ] `POST /register`, in this order:
  1. Refuse when `auth.ClientIP` reached `registration.maxPerIp` within `registration.ipWindowHours`.
  2. Check the fields with Holo's texts: the name, the password and its confirmation, a birth date that exists, the
     email and its confirmation, the terms, the figure and the gender. A form without a figure, such as one sent
     without JavaScript, gets `registration.defaultFigure` and `registration.defaultGender`.
  3. An email that already exists gets "sign in and add a habbo", and a taken name gets Holo's text.
  4. Hash the password, then create the account through `auth.CreateAccount` in one transaction, with
     `registration.startCredits` and a welcome ledger row only when they are above 0, as Holo does.
  5. A conflict from a concurrent registration gets the same text as step 3 (`store.IsConflict`).
  6. Sign in with `auth.Login` and redirect to `/me`.
- [ ] Tests in `packages/cms`:
  - every rejected field;
  - the per-IP limit;
  - the existing email and the taken name;
  - the rows of a successful registration, the wallet and its ledger row;
  - start credits of 0;
  - the session after registering;
  - each `check-name` answer.
- [ ] Docs: the Runtime section of `packages/cms/AGENTS.md` and `packages/auth/README.md`.

# Verification

```sh
pnpm --filter @project-reborn/cms build
grep -c '\[\[' packages/cms/dist/register.html
grep -c 'client="only"' packages/cms/dist/register.html
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
```

Then run the production binary, register in a browser with the avatar editor, and check the name check and `/me`.

# Notes

- The defaults of `registration.maxPerIp` and `registration.ipWindowHours` are new: Holo had no limit
  ([0021](/decisions/0021-dropped-and-kept-features.md) replaced its captcha with one).
- The phase lists only the name check as a JSON route, so `ajax_emailcheck.php` and `ajax_password.php` become
  checks in `POST /register`.
- `registration.maxHabbosPerUser` waits for P2, which is the first to read it.
- An IP-banned visitor can create an account, but `auth.Login` refuses them right after, with the ban text.
