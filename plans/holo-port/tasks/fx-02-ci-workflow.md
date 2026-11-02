---
type: Task
title: Run every gate on GitHub Actions
description: ci.yml runs every gate and the browser suites on pushes to main and on pull requests.
status: todo
phase: fx
depends_on: [fx-01]
packages: [.github/workflows]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

A push to `main` proves the same things the clean-checkout gate proves here.

# Steps

- [ ] `.github/workflows/ci.yml`: `make install`, every Go module of `go.work`, the component tests, `svelte-check`, the
  frontends, `sqlc generate` with no diff and `make check-docs`.
- [ ] The browser suites, with Chromium installed by the workflow.
- [ ] Run the same commands locally from a clean checkout.

# Verification

```sh
# the workflow's commands from a clean checkout; GitHub runs them once the user pushes
```

# Notes

- None yet.
