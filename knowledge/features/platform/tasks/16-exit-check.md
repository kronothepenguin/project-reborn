---
type: Task
title: Check the platform feature's behaviours
description: Every behaviour of the platform feature is checked on main and its evidence written in the report, and the feature is closed or what is left is reported.
scope: []
depends_on: [15-documents]
skills: []
---

# Goal

The platform feature is done, with evidence for each behaviour of [the spec](/features/platform/spec.md).

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- The master closes the feature.

# Steps

- [ ] Each behaviour is checked on a worktree of `main`, and its evidence written in the report: the commands, their
  output, and what the browser suites showed.
- [ ] What fails becomes a new task of the feature, never a wider one.

# Checks

```sh
make check
make e2e
```
