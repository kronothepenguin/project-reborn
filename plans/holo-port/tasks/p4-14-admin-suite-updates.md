---
type: Task
title: Count the updates in the admin suite from the release
description: The housekeeping-admin browser suite expects as many applied updates as the release has migration files, instead of the four it counted before 0005.
status: done
phase: p4
depends_on: [p4-03]
packages: [tests/e2e]
holo: []
timestamp: 2026-11-04T02:44:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T02:44:18+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T02:44:47+00:00"}
---

# Goal

The `housekeeping-admin` suite passes with every update of the release applied. It counted four rows on the update
page, and [p4-03](/tasks/p4-03-store.md) added a fifth update.

# Steps

- [x] The suite counts the release's migration files and finds as many rows.

# Verification

```sh
cd tests/e2e && pnpm test housekeeping-admin
```

Results (2026-11-04T02:44:47+00:00):

- `pnpm test housekeeping-admin` passes all 47 checks: the update page lists one row for each of the release's five
  migration files.

# Notes

- None.
