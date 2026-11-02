---
type: Task
title: Run every gate on GitHub Actions
description: ci.yml runs every gate and the browser suites on pushes to main and on pull requests.
status: done
phase: fx
depends_on: [fx-01]
packages: [.github/workflows]
holo: []
timestamp: 2026-11-02T01:44:56+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:44:56+00:00"}
---

# Goal

A push to `main` proves the same things the clean-checkout gate proves here.

# Steps

- [x] `.github/workflows/ci.yml`: `make install`, every Go module of `go.work`, the component tests, `svelte-check`, the
  frontends, `sqlc generate` with no diff and `make check-docs`.
- [x] The browser suites, with Chromium installed by the workflow.
- [x] Run the same commands locally from a clean checkout.

# Verification

```sh
# the workflow's commands from a clean checkout; GitHub runs them once the user pushes
```

Results (2026-11-02T01:44:56+00:00):

- The workflow file parses as YAML, with PyYAML. GitHub runs it for real once the user pushes.
- Its commands passed from a clean checkout: `make install` and `make gates` left the tree unchanged, and `make e2e` passed all
  365 checks.

# Notes

- `make gates` keeps the gates in one place, so CI and the agent run the same commands.
- `actionlint` was not run. Fetching it would have run code from the internet, which the permission system refused.
