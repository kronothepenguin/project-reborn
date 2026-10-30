---
type: Task
title: Build registration
description: Make /register create an account with the avatar editor, the live name check and the per-IP limit, then sign the visitor in.
status: done
phase: p1
depends_on: [p1-01, p1-02, p1-03]
packages: [packages/auth, packages/virtual, packages/cms]
holo: [source/holo/register.php, source/holo/ajax_namecheck.php, source/holo/ajax_emailcheck.php, source/holo/ajax_password.php, source/holo/web-gallery/static/js/registration.js]
timestamp: 2026-10-30T22:22:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-30T22:22:14+00:00"}
---

# Goal

A visitor creates an account with a habbo and is signed in on `/me`.

# Steps

- [x] Declare `registration.maxPerIp` (default 5), `registration.ipWindowHours` (default 24),
      `registration.defaultFigure` (the installer's figure) and `registration.defaultGender` (`M`).
- [x] `ValidateFigure` in `packages/auth` for the dot format, including an empty colour such as `ha-1001-`.
- [x] `register.astro`: finish the form with `method="post"`, the inputs that are missing their names (the
      password confirmation and both email fields, which are also typed `password`), the birth-date `Select`s, the
      `Checkbox`es, a `Notice` per section and the entered values kept after an error. The order of the sections
      stays.
- [x] ⚡`register/name-check`: wraps the name input and the `Icon` button and calls `POST /register/check-name`.
- [x] ⚡`habbo/avatar-editor`: replaces the example's inline script with an island around
      `public/habbo-editor.iife.js`, the HTML5 port of Holo's Flash editor
      (`vendor/HabboWidgets/habbo-registration/version-2.0/README.md`). The script attaches itself when it loads, so
      the island first sets `window.HabboEditorConfig` and `window.HabboEditor` and mounts `#editor-container`. P2's
      look editor reuses it.
  - `setGenderAndFigure` writes the hidden `figure` and `gender` inputs, which is how the look reaches the backend.
  - `setEditorState` writes a hidden `editorState` input, passed back as `menuState` when an error shows the form
    again.
  - `setAllowedToProceed` enables or disables the submit button.
  - `showHabboClubNotice` and `hideHabboClubNotice` show and hide a `Notice`; `showClubSelections` is off, as in
    Holo.
  - The island reads the starting look from the hidden inputs, since islands get no `[[ ]]` values.
  - `assetsPath` is `/`, because the default is relative to the page and `/account/looks` would miss the assets.
- [x] `POST /register/check-name` (`internal/router/register-check-name.go`): answers JSON with Holo's texts for a
      taken, invalid, too long or empty name.
- [x] `GET /register` with a session redirects to `/me`.
- [x] `GET /register?gender=…&figure=…`, which the landing widget sends, starts the editor on that look when both
      are valid.
- [x] `POST /register`, in this order:
  1. Refuse when `auth.ClientIP` reached `registration.maxPerIp` within `registration.ipWindowHours`.
  2. Check the fields with Holo's texts: the name, the password and its confirmation, a birth date that exists, the
     email and its confirmation, the terms, the figure and the gender. A form without a figure, such as one sent
     without JavaScript, gets `registration.defaultFigure` and `registration.defaultGender`.
  3. An email that already exists gets "sign in and add a habbo", and a taken name gets Holo's text.
  4. Hash the password, then create the account through `auth.CreateAccount` in one transaction, with
     `registration.startCredits` and a welcome ledger row only when they are above 0, as Holo does.
  5. A conflict from a concurrent registration gets the same text as step 3 (`store.IsConflict`).
  6. Sign in with `auth.Login` and redirect to `/me`.
- [x] Tests in `packages/cms`:
  - every rejected field;
  - the per-IP limit;
  - the existing email and the taken name;
  - the rows of a successful registration, the wallet and its ledger row;
  - start credits of 0;
  - the session after registering;
  - each `check-name` answer.
- [x] Docs: the Runtime section of `packages/cms/AGENTS.md` and `packages/auth/README.md`.

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

Results (2026-10-30T22:22:14+00:00):

- The CMS builds, `dist/register.html` keeps its `[[ ]]` placeholders and both islands carry `client="only"`.
- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`, `packages/auth`, `packages/virtual` and
  `packages/installer`.
- Mutation checks: each of these, applied on purpose, failed a test:
  - no handling of a conflict from a concurrent registration;
  - no per-IP limit;
  - no sign-in after registering;
  - impossible dates accepted;
  - no default look;
  - an unvalidated look from the link;
  - the newsletter choice not stored;
  - an unbounded `check-name` body.
- End-to-end run of the production binaries in a real Chromium:
  - the editor loaded and filled the hidden `figure` and `gender` inputs, and Randomize changed them;
  - the name check showed Holo's text for a taken name and for a free one;
  - a failed submit kept the name, the date, the email and the newsletter choice;
  - after opening another menu tab, the look and the `editorState` value survived a failed submit once the editor had
    restarted;
  - registering landed on `/me`, and the database held the exact figure and gender the editor produced, the birth date,
    the newsletter choice, the visitor's address, a wallet of 500 credits and a `Welcome to Reborn Hotel!` ledger row;
  - `/register?gender=m&figure=…` started the editor on that look;
  - the only failed request was the expected 422, and the server log stayed free of errors.

# Notes

- The defaults of `registration.maxPerIp` and `registration.ipWindowHours` are new: Holo had no limit
  ([0021](/decisions/0021-dropped-and-kept-features.md) replaced its captcha with one).
- The phase lists only the name check as a JSON route, so `ajax_emailcheck.php` and `ajax_password.php` become
  checks in `POST /register`.
- `registration.maxHabbosPerUser` waits for P2, which is the first to read it.
- An IP-banned visitor can create an account, but `auth.Login` refuses them right after, with the ban text.
- `register.go` shows every problem of a submitted form at once, as Holo does. The per-IP limit comes first and stops
  there.
- `POST /register` adds `ErrHabboNameEmpty`, `ErrHabboNameTooLong` and `ErrHabboNameReserved` to `packages/auth`, so
  that the texts need no second copy of the name rule, and `ValidateEmail` now also limits the length to 254 bytes.
- The newsletter box starts unchecked, as in the page the user wrote; Holo's started checked.
- The name check and the form share one set of Holo's texts, those of `register.php`. The available-name text comes from
  `templates/login/register_subheader.php`.
- `registration.defaultFigure` is the installer's figure.
- The editor's spread of its config means that an undefined value replaces a default, so the island only passes values
  that are set.
