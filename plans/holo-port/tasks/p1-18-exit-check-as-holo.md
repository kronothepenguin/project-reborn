---
type: Task
title: Verify P1 against Holo
description: Run the whole signed-out flow again on the production binaries, finish the list of differences and close the phase.
status: todo
phase: p1
depends_on: [p1-12, p1-13, p1-14, p1-15, p1-16, p1-17]
packages: [apps/cms, apps/installer]
holo: []
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
---

# Goal

Check the [P1 exit criteria](/phases/p1-signed-out.md) again, now against [0034](/decisions/0034-behaviour-matches-holo.md).

# Steps

- [ ] Run the flow of [p1-09](/tasks/p1-09-exit-check.md) again from a clean build, in a real Chromium.
- [ ] Go through Holo's pages state by state, and fix or list everything that differs.
- [ ] Finish [the differences](/reference/holo-differences.md).
- [ ] Close the phase: P1 `done`, P2 `active`, and the current phase in `/index.md`.

# Verification

All the gates of the repository, then the flow on the production binaries.

# Notes

- This task only verifies. A bug it finds becomes a new task.
