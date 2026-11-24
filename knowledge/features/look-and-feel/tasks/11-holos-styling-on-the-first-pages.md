---
type: Task
title: Holo's styling, cloned on the shared parts, the layouts and three pages
description: The shared parts, both layouts and the front, community and Me pages match HoloCMS at Holo's own sizes, compared side by side and one over the other, with Tailwind's closest common classes.
scope: [packages/components, packages/cms, tests/e2e]
depends_on: []
skills: [building-svelte-primitives, building-astro-components, testing-behaviours]
---

# Goal

Three pages that the user cannot tell from Holo's at a glance, for the rest of the site to follow.

# Context

- [Spec](/features/look-and-feel/spec.md), `### Holo's styling, cloned` under `## Next`.
- [Plan](/features/look-and-feel/plan.md): the user's words under Decisions, and "How a page is cloned" under Notes.
- [The comparison](/features/look-and-feel/research-holo-look.md): Holo's numbers.
- HoloCMS on `http://localhost:11300`, and `source/holocms` for its markup and CSS.
- The site before the bigger design: `git show a7d85cee^:<path>` gives each file of `packages/components` and
  `packages/cms` at Holo's sizes.

# Steps

- [ ] The shared parts at Holo's sizes: `Button`, `Card`, `Paper`, `Tabs` with its colours, `Notice`, `Bubble`,
  `Table`, the inputs. The line under a box's tabs runs the box's full width.
- [ ] Both layouts as Holo's: the 930px page, the header, the two-tone main tabs, the sub-navigation, the habbo
  search on one line, the footer, in Holo's font.
- [ ] The front page, the community page and the Me page, box by box beside Holo's.
- [ ] For each page: a picture of Holo's and ours side by side at 1366px, and one of the difference between the two
  screenshots, until what differs is content alone.
- [ ] The browser suites follow: the checks of 16px, of 1240px and of 1352px go, and checks of Holo's sizes come.

# Checks

```sh
make -C packages/components check
make -C packages/cms check
make e2e
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/components` and
`packages/cms`.
