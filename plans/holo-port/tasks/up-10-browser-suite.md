---
type: Task
title: Test updates in a real browser
description: A browser suite takes a hotel installed before updates existed through maintenance, sign-in, housekeeping's update page and config.json, until the hotel opens with Holo's home store.
status: done
phase: up
depends_on: [up-06, up-07, up-08, up-09]
packages: [tests/e2e]
holo: []
timestamp: 2026-11-03T23:48:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T23:48:17+00:00"}
---

# Goal

The whole update of a hotel works in a real browser, on the production binaries.

# Steps

- [x] A suite `updates`, registered in `run.mjs` and listed in `tests/e2e/README.md`.
- [x] Its hotel is made like one installed before updates existed: no `migrations` table and an empty home store.
- [x] A guest sees maintenance, staff without the attribute see that the hotel is being updated, and the administrator
  signs in, applies the updates, finds a copy of the database, and finds the hotel open with Holo's home store.
- [x] A config.json without a key shows it on the update page, and saving writes it.
- [x] Screenshots of maintenance, the update page before and after, and config.json's keys.

# Verification

```sh
cd tests/e2e && pnpm test updates
```
