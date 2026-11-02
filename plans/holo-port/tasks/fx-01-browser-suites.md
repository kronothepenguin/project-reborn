---
type: Task
title: Move the browser suites into the repository
description: The Playwright suites and their runner move from a temporary folder into tests/e2e, so they survive and CI can run them.
status: done
phase: fx
depends_on: []
packages: [tests/e2e]
holo: []
timestamp: 2026-11-02T01:38:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:38:41+00:00"}
---

# Goal

The browser checks live in the repository and run with one command.

# Steps

- [x] Move the suites of P2, the checks of HK-A and the walk across the programs into `tests/e2e`.
- [x] A runner that builds the binaries, installs a throwaway hotel, runs a mail stub and starts the programs on free
  ports.
- [x] The runner refuses a busy port and never touches a server it did not start.
- [x] `make e2e`, and a README.

# Verification

```sh
make e2e
```

Results (2026-11-02T01:38:41+00:00):

- `make e2e` built the three frontends and programs, installed a throwaway hotel and passed 365 checks in 12 suites, with every
  server log clean: the 223 of P2, 117 of housekeeping and 25 across the three programs, in under two minutes.
- With port 17306 held on purpose, the run refused to start with exit status 2.
- With a check broken on purpose, the run reported it and exited with status 1.

# Notes

- The runner passes everything to the suites as arguments, so it needs no environment variables.
- Each suite gets a fresh copy of the hotel. One check of `housekeeping-admin` had relied on a note saved by an earlier part,
  so that suite now saves its own.
- `together` has 25 checks, not 28: it is one walk now, so its check for script errors runs once.
- `node:sqlite` replaces the Python helpers, and `lib/mail.mjs` replaces `smtp.py`.
