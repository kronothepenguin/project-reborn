---
type: Task
title: The browser suite reborn
description: A browser suite builds reborn and checks, from an empty folder, the installer, the move to a new port, the hotel after the install, the game's first message, and a stop in order.
status: todo
slice: platform
depends_on: [platform-05, platform-10]
packages: [tests/e2e]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

reborn's whole path is checked in a real browser, as every program's is.

# Steps

- [ ] The harness builds `reborn` beside the other programs, knows its start-up line (`reborn on http://...`), and starts
  it in a temporary folder on free ports.
- [ ] A suite `reborn`: `/` redirects to `/installer/`; the config step with another free port lands there and the old
  port refuses connections; the site and administrator steps end on the site's front page; `/installer/` answers 404;
  the administrator signs in and opens `/housekeeping/`; a WebSocket on the info port receives the game's first
  message; a second start in the same folder goes straight to the hotel; Ctrl-C stops it, and a habbo logged in through
  the game's test client is logged out.
- [ ] No log line beyond the start-up lines, as the other suites require.

# Verification

```sh
make e2e
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `platform-13`.
- The user's CMS dev runner may hold 17387: every port is taken free
  (`tests/e2e/lib/hotel.mjs`, `freePort`).
