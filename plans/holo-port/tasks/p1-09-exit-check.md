---
type: Task
title: Verify the P1 exit criteria
description: Run the whole signed-out flow end to end on the production binaries and close the phase.
status: done
phase: p1
depends_on: [p1-01, p1-02, p1-03, p1-04, p1-05, p1-06, p1-07, p1-08]
packages: [apps/cms, apps/installer]
holo: []
timestamp: 2026-10-30T22:42:25+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-30T22:42:25+00:00"}
---

# Goal

Check the [P1 exit criteria](/phases/p1-signed-out.md) across tasks, on binaries built the way production builds them.

# Steps

- [x] Build the frontends and both binaries, and run the installer in an empty directory, with a throwaway SMTP
      server for the mail settings.
- [x] Run the flow: register through a `?refer=` link → signed in on `/me` → sign out → sign in by habbo name →
      forgot → the mailed link → reset → the old password refused and the new one accepted.
- [x] Repeat a wrong password until `auth.loginMaxFailures` refuses it.
- [x] Check that the referrer was paid, and that the new habbo has its wallet, ledger row, profile and home.
- [x] Check that every built page keeps its `[[ ]]` placeholders and that its islands carry `client="only"`.
- [x] Check that a cross-site request to each `POST` route gets 403.
- [x] Check that a maintenance row and a restart serve 503, and that the administrator can still sign in and pass.
- [x] Close the phase: P1 `done`, P2 `active`, and the current phase in `/index.md`.

# Verification

The results of each step, recorded here.

Results (2026-10-30T22:42:25+00:00):

Run from a clean build of both frontends and both binaries, in an empty directory, with the installer's default secure
cookies and a throwaway SMTP server. The flow ran in a real Chromium.

- The flow:
  - registering through `/register?refer=Admin-1` signed in on `/me`, with the avatar image loaded;
  - signing out returned to `/`;
  - signing in by habbo name worked, ignoring case;
  - `/forgot` sent one mail, and its link set a new password;
  - the old password was refused and the new one signed in.
- The database:
  - the referrer went from 5000 to 5050 credits, with a `referral` ledger row naming the new habbo;
  - the referral row names both and is marked as paid;
  - the new habbo has the editor's exact figure, a wallet of 500 credits, a `registration` ledger row reading
    `Welcome to Reborn Hotel!`, a profile and a home;
  - the password is an argon2id hash.
- Built pages: all eight keep their `[[ ]]` placeholders. `index.html` carries one `client="only"` island and
  `register.html` two.
- Cross-site requests to `POST /`, `/logout`, `/register`, `/register/check-name`, `/forgot` and `/reset/{token}` all got
  403.
- Maintenance, with a row and a restart: guests got 503 on `/`, `/register` and `/privacy`, a player could sign in but
  still got 503 on `/me`, and the administrator signed in, opened `/me` and signed out. Without the row `/` answered 200.
- Throttle: with `auth.loginMaxFailures` at 5, the sixth attempt was refused, and then so was the right password.
- The only failed request in the browser was the deliberate old-password attempt, and the server log stayed free of
  errors.
- Across the repository afterwards, `gofmt`, `go vet` and `go test -race` pass in all ten Go modules, 112 component tests
  and `svelte-check` pass, both frontends build, and the store's docs and generated code are clean.

# Notes

- This task only verifies. A bug it finds becomes a new task.
