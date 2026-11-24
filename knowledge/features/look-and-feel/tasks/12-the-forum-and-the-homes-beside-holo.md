---
type: Task
title: The forum, the homes and the groups beside Holo's
description: The discussion board, a habbo's home and a group's page match HoloCMS box for box: the board's box as wide as Holo's, the home's canvas and its widgets whole.
scope: [packages/cms, tests/e2e]
depends_on: []
skills: [building-astro-components, adding-svelte-interactivity, testing-behaviours]
---

# Goal

The three pages the user saw wrong first look like Holo's.

The user, 2026-11-24: "/forum looks odd, the content is outside", and "/home/{user} looks odd, the content is bigger
than nav, and the user plate looks cutted".

# Context

- [Spec](/features/look-and-feel/spec.md), `### Holo's styling, cloned` under `## Next`.
- [Plan](/features/look-and-feel/plan.md): "The sizes", the user's words under Decisions, and "How a page is cloned"
  under Notes.
- `packages/cms/knowledge/layouts.md`: the layouts as cloned.
- HoloCMS on `http://localhost:11300`, signed in as the habbo the user gave, and `source/holocms`.

# Steps

- [ ] The discussion board, a thread and its forms: the box's width and place as Holo's, its rows filling it.
- [ ] A habbo's home, in view and in edit: the canvas's width and place as Holo's, and every widget whole, the profile
  widget's title bar and body the same width.
- [ ] A group's page and its discussion, as the home.
- [ ] For each page: Holo's and ours side by side at 1366px and the picture of their difference, until content alone
  differs.
- [ ] Checks in the browser suites for what was wrong: the board's box, the canvas, the widget.

# Checks

```sh
make -C packages/cms check
make e2e
```

Then `make check` in every project that `make dependants project=packages/cms` prints.
