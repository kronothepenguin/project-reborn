---
type: Task
title: Compare the look with HoloCMS, page by page
description: Every page of the site is set beside Holo's and beside its old self, with screenshots, and what differs is listed for the user.
scope: [knowledge]
depends_on: [11-holos-styling-on-the-first-pages]
skills: [testing-behaviours, documenting-with-okf]
---

# Goal

The user sees the new look beside Holo's, and the documents say what is built.

# Context

- [Spec](/features/look-and-feel/spec.md)
- [Plan](/features/look-and-feel/plan.md)
- [The comparison](/features/look-and-feel/research-holo-look.md), "How each system was run".

# Steps

- [ ] Screenshots of every page of the site, of housekeeping's main pages and of each installer step, at 1366px and
  1920px.
- [ ] Each difference from Holo's look that remains, with the page and the reason.
- [ ] Root `make check` and `make e2e`.
- [ ] Move the spec's `## Next` lines up, the plan's rows to `Built:`, and set the spec's `status: done`.

# Checks

```sh
make check
make e2e
```
