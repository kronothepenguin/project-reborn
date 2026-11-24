---
type: Task
title: The site's other pages beside Holo's
description: News, staff, tags, credits, club, the account pages, help, register and the client page match HoloCMS box for box.
scope: [packages/cms, tests/e2e]
depends_on: []
skills: [building-astro-components, adding-svelte-interactivity, testing-behaviours]
---

# Goal

Every page of the site outside the forum, the homes and the groups has been set beside Holo's.

# Context

- [Spec](/features/look-and-feel/spec.md), `### Holo's styling, cloned` under `## Next`.
- [Plan](/features/look-and-feel/plan.md): "The sizes", the user's words under Decisions, and "How a page is cloned"
  under Notes.
- `packages/cms/knowledge/layouts.md`: the layouts as cloned.
- HoloCMS on `http://localhost:11300`, signed in as the habbo the user gave, and `source/holocms`.

# Steps

- [ ] The pages, one after the other: news and an article, staff, tags and a tag's search, credits, club and the
  transactions, the account pages, help, register, forgot and reset, the client page with its error pages.
- [ ] For each page: Holo's and ours side by side at 1366px and the picture of their difference, until content alone
  differs. A page Holo has no like of is checked against its neighbours.
- [ ] A list in the report of what was wrong on each page.
- [ ] The browser suites follow.

# Checks

```sh
make -C packages/cms check
make e2e
```

Then `make check` in every project that `make dependants project=packages/cms` prints.
