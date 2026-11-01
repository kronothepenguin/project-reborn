---
type: Task
title: Verify P1 against Holo
description: Run the whole signed-out flow again on the production binaries, finish the list of differences and close the phase.
status: done
phase: p1
depends_on: [p1-12, p1-13, p1-14, p1-15, p1-16, p1-17]
packages: [apps/cms, apps/installer]
holo: []
timestamp: 2026-11-01T18:56:51+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:56:51+00:00"}
---

# Goal

Check the [P1 exit criteria](/phases/p1-signed-out.md) again, now against [0034](/decisions/0034-behaviour-matches-holo.md).

# Steps

- [x] Run the flow of [p1-09](/tasks/p1-09-exit-check.md) again from a clean build, in a real Chromium.
- [x] Go through Holo's pages state by state, and fix or list everything that differs.
- [x] Finish [the differences](/reference/holo-differences.md).
- [x] Close the phase: P1 `done`, P2 `active`, and the current phase in `/index.md`.

# Verification

All the gates of the repository, then the flow on the production binaries.

Results (2026-11-01T18:56:51+00:00):

Run from a clean build of both frontends and both binaries, through the real installer and a throwaway SMTP server, in a
real Chromium. The server log stayed empty in every run.

- Flow, 65 checks:
  - the landing page's title, meta tags, stats, logo link, texts, bubble, advert and promo;
  - a referral registration: the editor's look, the newsletter, the referrer paid 5000 to 5050 with a ledger row, the
    referral row, the welcome row reading `Welcome to Reborn Hotel!`, and an argon2id hash;
  - the signed-in `/forgot` and `GET /logout`, signing out through the forgot page, `OK`, and the guest's `You are not
    logged in`;
  - signing in ignoring case;
  - a wrong pair on `/forgot`: the same answer and no mail; the right pair: one mail, Holo's subject and greeting, a link that
    works once, the old password refused and the new one accepted;
  - 5 requests for one account: 5 answers and 3 mails;
  - a ban while signed in: the ban page on the next page and the session gone;
  - the legal pages' titles and the footer;
  - the landing page without JavaScript;
  - cross-site posts to `POST /`, `/logout`, `/register`, `/register/check-name`, `/forgot` and `/reset/{token}`, all 403;
  - the sixth wrong password refused, and then the right one too.
- Registration, 66 checks: see [p1-17](/tasks/p1-17-registration-flow.md).
- Maintenance, 10 checks, with a row and a restart: guests got 503 on five pages with Frank's text and the bare title, a
  failed sign-in stayed on the page, and the administrator signed in, opened `/me` and signed out.
- Built pages: all nine keep their `[[ ]]` placeholders, `index.html` carries one `client="only"` island and `register.html`
  two.
- Repository:
  - `gofmt`, `go vet` and `go test -race` pass in all ten Go modules, with 315 tests;
  - 116 component tests and `svelte-check` pass, and both frontends build;
  - `sqlc generate` changes nothing and `make check-docs` passes.
- A clean checkout of `a09fa24f`: `make install`, a build with no frontend, both binaries, all the tests and the components
  passed.

# Notes

- This task only verifies. A bug it finds becomes a new task.
- The screenshots found two flaws the assertions did not, which became [p1-19](/tasks/p1-19-text-fixes.md).
- Waiting past the avatar editor's start-up block found the disabled `Done` button, fixed in
  [p1-17](/tasks/p1-17-registration-flow.md). The first exit check, [p1-09](/tasks/p1-09-exit-check.md), clicked too soon to
  see it.
