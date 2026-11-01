---
type: Task
title: Verify the P2 exit criteria
description: Run the signed-in flows on the production binaries, list the differences from Holo and close the phase.
status: done
phase: p2
depends_on: [p2-02, p2-03, p2-04, p2-05, p2-06]
packages: [apps/cms]
holo: []
timestamp: 2026-11-01T21:29:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:58:04+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:29:17+00:00"}
---

# Goal

Check the [P2 exit criteria](/phases/p2-me-account.md) against [0034](/decisions/0034-behaviour-matches-holo.md).

# Steps

- [x] Go through Holo's pages state by state in a real Chromium, from a clean build.
- [x] Add P2's rows to [the differences](/reference/holo-differences.md).
- [x] Run every gate from a clean checkout.
- [x] Close the phase.

# Verification

All the gates of the repository, then the flows on the production binaries.

Results (2026-11-01T21:29:17+00:00):

From a clean build of both frontends and both binaries, through the real installer and a throwaway SMTP server, in a real
Chromium. The server log stayed empty in every run.

- 223 browser checks passed in seven suites: the signed-out flow (66), registration (66), the Me page (29), Looks (13), the
  other account tabs (23), several habbos (15) and maintenance (11).
- The exit criteria hold:
  - both header states render, compared with a render of Holo's own CSS, and a player sees no Housekeeping tab while staff see
    it, with the link in the signed-out footer;
  - motto edit, alert dismiss, looks change, email and password change, and adding and switching habbos all work;
  - staff passing maintenance see the alert above and below the page.
- From a clean checkout: `make install` and a build with no frontend passed, `gofmt`, `go vet` and `go test -race` pass in all
  eleven Go modules, with 404 tests, 118 component tests and `svelte-check` pass, both frontends build, `sqlc generate`
  changes nothing and `make check-docs` passes.
- All 15 built pages keep their `[[ ]]` placeholders. `index.html` and `account/looks.html` carry one `client="only"` island,
  `account/habbos.html` one, and `me.html` and `register.html` two.

# Notes

- This task only verifies. A bug it finds becomes a new task.
