---
type: Task
title: Verify the P1 exit criteria
description: Run the whole signed-out flow end to end on the production binaries and close the phase.
status: todo
phase: p1
depends_on: [p1-01, p1-02, p1-03, p1-04, p1-05, p1-06, p1-07, p1-08]
packages: [apps/cms, apps/installer]
holo: []
timestamp: 2026-10-30T21:10:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
---

# Goal

Check the [P1 exit criteria](/phases/p1-signed-out.md) across tasks, on binaries built the way production builds them.

# Steps

- [ ] Build the frontends and both binaries, and run the installer in an empty directory, with a throwaway SMTP
      server for the mail settings.
- [ ] Run the flow: register through a `?refer=` link → signed in on `/me` → sign out → sign in by habbo name →
      forgot → the mailed link → reset → the old password refused and the new one accepted.
- [ ] Repeat a wrong password until `auth.loginMaxFailures` refuses it.
- [ ] Check that the referrer was paid, and that the new habbo has its wallet, ledger row, profile and home.
- [ ] Check that every built page keeps its `[[ ]]` placeholders and that its islands carry `client="only"`.
- [ ] Check that a cross-site request to each `POST` route gets 403.
- [ ] Check that a maintenance row and a restart serve 503, and that the administrator can still sign in and pass.
- [ ] Close the phase: P1 `done`, P2 `active`, and the current phase in `/index.md`.

# Verification

The results of each step, recorded here.

# Notes

- This task only verifies. A bug it finds becomes a new task.
