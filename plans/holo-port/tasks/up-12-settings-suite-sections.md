---
type: Task
title: Keep the settings suite to the settings sections
description: The housekeeping-settings browser suite opens only the settings sections of the menu, since the Database updates link leads to a page without a form when nothing waits.
status: done
phase: up
depends_on: [up-05]
packages: [tests/e2e]
holo: []
timestamp: 2026-11-03T23:57:40+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T23:56:43+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T23:57:40+00:00"}
---

# Goal

The clean checkout of [up-11](/tasks/up-11-exit-check.md) passes every browser suite.

# Steps

- [x] The suite's walk opens the menu links of settings sections only, the ones it names in its checks.

# Verification

```sh
cd tests/e2e && pnpm test housekeeping-settings housekeeping-admin updates
```

Results (2026-11-03T23:57:40+00:00):

- `pnpm test housekeeping-settings housekeeping-admin updates` passes all 85 checks on freshly built binaries.
- The settings suite opens the nine settings sections of the menu and checks that it found them, and no longer opens the
  update page or the home store page, which `updates` and `housekeeping-store` cover.

# Notes

- The clean checkout of up-11 failed `section null :: Waiting Updates, 0 inputs`: the suite opened every link of the menu
  and wanted a form on each, and the home store page had passed only because it has one.
