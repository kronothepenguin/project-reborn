---
type: Task
title: Sign in and sign out
description: Make POST / sign in with auth.Login, add POST /logout and the minimal GET /me page, and send signed-in visitors from / to /me.
status: todo
phase: p1
depends_on: [p1-01]
packages: [packages/virtual, packages/cms]
holo: [source/holo/index.php, source/holo/logout.php, source/holo/security_check.php]
timestamp: 2026-10-30T21:10:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
---

# Goal

A habbo signs in from the landing page and lands on `/me`, as [0031](/decisions/0031-p1-minimal-me-page.md) says, and
can sign out there.

# Steps

- [ ] `HandleIndexLogin` calls `auth.Login` with the `remember` box and redirects to `/me`. A failure shows, with the
      typed habbo name kept in the form:
  - blank fields: "Please do not leave any fields blank.";
  - `ErrInvalidCredentials`: "Invalid username or password.";
  - `ErrThrottled`: a new text, since Holo had no throttle;
  - `*auth.BanError`: Holo's ban text with the reason and the end, plus a form for a permanent ban.
- [ ] During maintenance the form is on `maintenance.html`, so a failed sign-in there renders that page again and
      not `index.html`.
- [ ] `GET /{$}` with a session redirects to `/me`.
- [ ] `GET /me` (`internal/router/me.go`, `me.astro`): needs a session and shows the active habbo with `Avatar` and a
      Sign out form. Maintenance applies to it like every page.
- [ ] Declare `imaging.avatarUrl` with the default from [0032](/decisions/0032-avatar-imager-default.md) and a
      validator for an http or https URL.
- [ ] `POST /logout` (`internal/router/logout.go`) calls `auth.Logout` and redirects to `/`. Like `POST /`, it stays
      open during maintenance.
- [ ] Page data: the `signed-out` layout reads `.Online` and `.OnlineCount`, so the page structs embed one small
      struct with those fields. The hotel stays offline ([0013](/decisions/0013-defer-game-server-features.md)).
- [ ] `Notice` replaces the error box of `index.astro`, and `maintenance.astro` gets one too.
- [ ] Tests in `packages/cms`:
  - sign-in success, the session cookie and the redirect;
  - each failure text;
  - the throttle after `auth.loginMaxFailures`;
  - a failed sign-in during maintenance;
  - `/` with a session and `/me` without one;
  - sign-out ends the session.
- [ ] Docs: the Runtime section of `packages/cms/AGENTS.md`.

# Verification

```sh
pnpm --filter @project-reborn/cms build
grep -c '\[\[' packages/cms/dist/index.html packages/cms/dist/me.html packages/cms/dist/maintenance.html
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
```

Then run the production binary in a directory set up by the installer, sign in as the administrator and sign out.

# Notes

- Holo's `logout.php` showed a confirmation page. The phase has no page for it, so `POST /logout` only redirects.
- `security_check.php` re-read the password after signing in; server-side sessions make it unnecessary.
