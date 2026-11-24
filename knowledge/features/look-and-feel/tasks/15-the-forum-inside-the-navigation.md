---
type: Task
title: The forum inside the navigation's width
description: The discussion board and a thread shrink to the sub-navigation's width, and the sub-navigation is the same on every page of the community layout.
scope: [packages/cms, tests/e2e]
depends_on: []
skills: [building-astro-components, testing-behaviours]
---

# Goal

The navigation looks the same on every page, and the forum fits under it.

The user, 2026-11-24: "for the forum, i prefer to shrink the content instead of growing the nav, nav must look the same
for all pages of community layout."

# Context

- [Spec](/features/look-and-feel/spec.md), `### The forum inside the navigation` under `## Next`.
- `packages/cms/knowledge/layouts.md`, "Wide pages": the `wide` prop of the community layout, which the forum uses
  today.
- `packages/cms/src/components/forum/`.

# Steps

- [ ] The board and a thread use the layout's own sub-navigation, 761px, and their box is as wide.
- [ ] The board's and a thread's rows fill that box: Holo's columns keep their proportions.
- [ ] The dialogs of the forum (a new thread, a reply, a report) fit the box.
- [ ] Each looked at in a screenshot at 1366px beside the community page: the box's edges under the navigation's.
- [ ] The suite `myhabbo` follows: the forum's box ends where the sub-navigation ends.

# Checks

```sh
make -C packages/cms check
make e2e
```

Then `make check` in every project that `make dependants project=packages/cms` prints.
