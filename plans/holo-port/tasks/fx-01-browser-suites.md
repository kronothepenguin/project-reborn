---
type: Task
title: Move the browser suites into the repository
description: The Playwright suites and their runner move from a temporary folder into tests/e2e, so they survive and CI can run them.
status: todo
phase: fx
depends_on: []
packages: [tests/e2e]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

The browser checks live in the repository and run with one command.

# Steps

- [ ] Move the suites of P2, the checks of HK-A and the walk across the programs into `tests/e2e`.
- [ ] A runner that builds the binaries, installs a throwaway hotel, runs a mail stub and starts the programs on free
  ports.
- [ ] The runner refuses a busy port and never touches a server it did not start.
- [ ] `make e2e`, and a README.

# Verification

```sh
make e2e
```

# Notes

- None yet.
