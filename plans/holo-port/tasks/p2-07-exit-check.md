---
type: Task
title: Verify the P2 exit criteria
description: Run the signed-in flows on the production binaries, list the differences from Holo and close the phase.
status: todo
phase: p2
depends_on: [p2-02, p2-03, p2-04, p2-05, p2-06]
packages: [apps/cms]
holo: []
timestamp: 2026-11-01T20:58:04+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:58:04+00:00"}
---

# Goal

Check the [P2 exit criteria](/phases/p2-me-account.md) against [0034](/decisions/0034-behaviour-matches-holo.md).

# Steps

- [ ] Go through Holo's pages state by state in a real Chromium, from a clean build.
- [ ] Add P2's rows to [the differences](/reference/holo-differences.md).
- [ ] Run every gate from a clean checkout.
- [ ] Close the phase.

# Verification

All the gates of the repository, then the flows on the production binaries.

# Notes

- This task only verifies. A bug it finds becomes a new task.
