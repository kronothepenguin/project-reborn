---
type: Task
title: Sign in and sign out
description: Make POST / sign in with auth.Login, add POST /logout and the minimal GET /me page, and send signed-in visitors from / to /me.
status: done
phase: p1
depends_on: [p1-01]
packages: [packages/virtual, packages/cms]
holo: [source/holo/index.php, source/holo/logout.php, source/holo/security_check.php]
timestamp: 2026-10-30T22:09:04+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-30T22:09:04+00:00"}
---

# Goal

A habbo signs in from the landing page and lands on `/me`, as [0031](/decisions/0031-p1-minimal-me-page.md) says, and
can sign out there.

# Steps

- [x] `HandleIndexLogin` calls `auth.Login` with the `remember` box and redirects to `/me`. A failure shows, with the
      typed habbo name kept in the form:
  - blank fields: "Please do not leave any fields blank.";
  - `ErrInvalidCredentials`: "Invalid username or password.";
  - `ErrThrottled`: a new text, since Holo had no throttle;
  - `*auth.BanError`: Holo's ban text with the reason and the end, plus a form for a permanent ban.
- [x] During maintenance the form is on `maintenance.html`, so a failed sign-in there renders that page again and
      not `index.html`.
- [x] `GET /{$}` with a session redirects to `/me`.
- [x] `GET /me` (`internal/router/me.go`, `me.astro`): needs a session and shows the active habbo with `Avatar` and a
      Sign out form. Maintenance applies to it like every page.
- [x] Declare `imaging.avatarUrl` with the default from [0032](/decisions/0032-avatar-imager-default.md) and a
      validator for an http or https URL.
- [x] `POST /logout` (`internal/router/logout.go`) calls `auth.Logout` and redirects to `/`. Like `POST /`, it stays
      open during maintenance.
- [x] Page data: the `signed-out` layout reads `.Online` and `.OnlineCount`, so the page structs embed one small
      struct with those fields. The hotel stays offline ([0013](/decisions/0013-defer-game-server-features.md)).
- [x] `Notice` replaces the error box of `index.astro`, and `maintenance.astro` gets one too.
- [x] Tests in `packages/cms`:
  - sign-in success, the session cookie and the redirect;
  - each failure text;
  - the throttle after `auth.loginMaxFailures`;
  - a failed sign-in during maintenance;
  - `/` with a session and `/me` without one;
  - sign-out ends the session.
- [x] Docs: the Runtime section of `packages/cms/AGENTS.md`.

# Verification

```sh
pnpm --filter @project-reborn/cms build
grep -c '\[\[' packages/cms/dist/index.html packages/cms/dist/me.html packages/cms/dist/maintenance.html
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
```

Then run the production binary in a directory set up by the installer, sign in as the administrator and sign out.

Results (2026-10-30T22:09:04+00:00):

- The CMS builds, and `dist/index.html`, `dist/me.html` and `dist/maintenance.html` keep their `[[ ]]` placeholders,
  including `value="[[ .Username ]]"` on both sign-in forms and the `Avatar` URL.
- `gofmt`, `go vet` and `go test -race` pass in all ten modules, because the settings catalogue changed: astro 3 test
  results, config 51, store 40, virtual 30, auth 41, installer 10, cms 19 and `tools/create` 3.
- Mutation checks: each of these, applied on purpose, failed a test:
  - a failed sign-in ignoring maintenance;
  - the sign-in form ignoring an existing session;
  - `POST /logout` without cross-origin protection;
  - `POST /` behind the maintenance gate;
  - `/me` without `auth.RequireSession`.
- End-to-end run of the production binaries, after the installer, with `curl` and with a real Chromium:
  - blank fields and a wrong password answered 422 with Holo's text and the name kept;
  - a hostile name came back escaped, with no raw `<script>`;
  - cross-site posts to `/` and `/logout` got 403, and the browser's own form posts went through;
  - signing in redirected to `/me`, with the habbo's image loaded from the habbo.com imager;
  - Chromium kept the cookie as `HttpOnly`, `Secure` and `SameSite=Lax` on `http://localhost`, and as persistent with
    Remember me;
  - `/` sent a signed-in visitor to `/me`, and after signing out the old cookie no longer opened `/me`;
  - with a maintenance row and a restart, `/` answered 503, a wrong password stayed on that page with its error, and
    the administrator signed in, opened `/me` and signed out;
  - after five failures the right password got "Too many failed attempts.";
  - the server log stayed free of errors.
- Screenshots of the failed sign-in, `/me` and the maintenance page look right.

# Notes

- Holo's `logout.php` showed a confirmation page. The phase has no page for it, so `POST /logout` only redirects.
- `security_check.php` re-read the password after signing in; server-side sessions make it unnecessary.
- A failed form answers 422, as in the installer. A failed sign-in during maintenance answers 503, like the rest of
  that page.
- `POST /` with a session redirects to `/me` without signing in again, as Holo does.
- The stub's 400 for a malformed form is gone: such a form reads as blank fields.
- `Router.Maintenance` now takes and returns an `http.Handler`, so that it composes with `auth.RequireSession` on `/me`.
- The error box moved into `landing/login-box.astro`, so the landing and maintenance pages share it. Every page with
  that component needs `Username` and `Error` in its data.
- The page title of `/me` is the habbo's name until P2.
