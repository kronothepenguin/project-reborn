---
type: Task
title: The homes and the groups inside the navigation's width
description: A habbo's home and a group's page get the 752px canvas under the community layout's own sub-navigation, the advert column goes, and the layout's wide form goes with it.
scope: [packages/cms, tests/e2e]
depends_on: []
skills: [building-astro-components, adding-svelte-interactivity, applying-go-patterns, testing-behaviours]
---

# Goal

Every page of the community layout stands under the same navigation, the homes and the groups too.

The user, 2026-11-24, chose "Canvas of 752px, no advert column": every home and group page gets the 752px canvas, the
club advert column goes, and club members and groups give up the extra 170px of canvas Holo gave them.

# Context

- [Spec](/features/look-and-feel/spec.md), `### The homes inside the navigation` under `## Next`.
- [Homes](/features/homes/spec.md) and [groups](/features/groups/spec.md): their lines on the canvas's width, the
  advert and where a widget may stand.
- `packages/cms/knowledge/layouts.md`, "Wide pages"; `packages/cms/src/components/homes/` and `src/pages/groups/`.

# Steps

- [ ] A home and a group's page, in view and in edit, use the layout's own sub-navigation, and their box is as wide.
- [ ] The canvas is 752px for every habbo and every group. The club's advert column and its text go.
- [ ] A widget, a sticker or a note is placed and saved inside the 752px canvas, in the editor and on the server; one
  saved further right before shows at the canvas's right edge.
- [ ] The layout's `wide` prop goes, with what only it used.
- [ ] The specs of homes and groups say the canvas is 752px for all.
- [ ] Each page looked at in a screenshot at 1366px beside the community page: the box's edges under the navigation's,
  every widget whole.
- [ ] Tests for each behaviour, and the suite `myhabbo` follows.

# Checks

```sh
make -C packages/cms check
make e2e
```

Then `make check` in every project that `make dependants project=packages/cms` prints.
