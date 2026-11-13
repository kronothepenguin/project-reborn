---
type: Task
title: Check the platform slice's exit criteria
description: Every exit criterion of the platform slice is checked on main and its evidence written here, and the slice is closed or what is left is reported.
status: todo
slice: platform
depends_on: [platform-15]
packages: []
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

The platform slice is done, with evidence for each exit criterion of [the slice](/slices/platform.md).

# Steps

- [ ] Each exit criterion is checked on a worktree of `main`, and its evidence written here: the commands, their
  output, and what the browser suites showed.
- [ ] What fails becomes a new task of the slice, never a wider one.

# Verification

```sh
make gates
make e2e
```

Results: written here once run.

# Notes

- Runs on the branch `platform-16`. The coordinator closes the slice.
