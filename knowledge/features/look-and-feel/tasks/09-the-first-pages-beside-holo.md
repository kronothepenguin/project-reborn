---
type: Task
title: The layout and two pages, reviewed beside HoloCMS
description: The community layout is rebuilt in flexbox for phones, tablets and wide screens, and the community and Me pages are reviewed beside HoloCMS until they read as Holo's at a bigger scale, with one page shown three ways for its pictures.
scope: [packages/cms, tests/e2e]
depends_on: []
skills: [building-astro-components, adding-svelte-interactivity, testing-behaviours]
---

# Goal

The user sees two finished pages beside Holo's and says whether the rest of the site follows them.

# Context

- [Spec](/features/look-and-feel/spec.md), `### The site, reviewed beside HoloCMS` under `## Next`.
- [Plan](/features/look-and-feel/plan.md): the user's words under Decisions, and the review's rules under Notes.
- HoloCMS on `http://localhost:11300` (`community.php`, `me.php`, `index.php`), and `source/holocms` for its markup.
- `packages/cms/src/layouts/community.astro`, `src/components/header/`, `src/pages/community.astro` and
  `src/pages/me.astro` with their components.

# Steps

- [ ] Screenshot Holo's community page and Me page on a wide screen, and keep them beside every screenshot of ours.
- [ ] The community layout in flexbox: the header, the tabs, the sub-navigation, the columns and the footer. Wide
  screens and tablets show two columns, a phone one column with each box as wide as the screen.
- [ ] The community page and the Me page, box by box beside Holo's: text at Holo's times 16/11, proportions as
  Holo's, pictures at their own size with boxes that wrap them.
- [ ] Look at each screenshot beside Holo's, list what reads oddly, fix it, and repeat until the list is empty.
- [ ] The community page three ways, for the user to choose: pictures at their own size, grown by 16/11 smooth, grown
  by 16/11 with sharp pixels.
- [ ] The browser suites follow the new layout.

# Checks

```sh
make -C packages/cms check
make e2e
```

Then `make check` in every project that `make dependants project=packages/cms` prints.
