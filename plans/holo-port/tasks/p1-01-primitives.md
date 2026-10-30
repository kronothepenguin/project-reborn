---
type: Task
title: Add the P1 primitives
description: Add Checkbox, Select, Notice and Avatar to packages/components and move Icon there from packages/cms, each with a story, a test and an export.
status: todo
phase: p1
depends_on: []
packages: [packages/components, packages/cms]
holo: [source/holo/web-gallery/v2/styles/style.css, source/holo/web-gallery/v2/styles/registration.css]
timestamp: 2026-10-30T21:10:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
---

# Goal

Give the P1 pages the small components they share, as primitives in `packages/components`.

# Steps

- [ ] `Checkbox` and `Select`, for the login and registration forms and the birth-date selects.
- [ ] `Notice` with the variants red, green, orange, blue and darkgray, from Holo's `div.rounded-*` and
      `flash-message` (`style.css:2088-2178`). Colours come from [colours](/reference/colours.md), and
      `tools/tw-color` answers for any colour not listed.
- [ ] `Avatar` with `imagingUrl`, `figure`, `size`, `direction`, `headDirection` and `gesture`, as
      [0008](/decisions/0008-configurable-avatar-imaging.md) describes. It joins the URL without encoding it, so that
      `[[ ]]` placeholders survive the build and `html/template` escapes the values at runtime.
- [ ] `Icon`: move `packages/cms/src/components/icon.svelte` and its sprite `button_icons2.png`, and update
      `register.astro`.
- [ ] Each primitive has a story and a test and is exported from `src/index.ts`, copying `paper.svelte`,
      `paper.test.ts` and `paper.stories.ts`.

# Verification

```sh
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
pnpm --filter @project-reborn/components build-storybook
pnpm --filter @project-reborn/cms build
```

The tests include one showing that `Avatar` keeps a `[[ .Figure ]]` placeholder in its `src`.

# Notes

- Every primitive has a call site in P1: `Avatar` on `/me` ([p1-02](/tasks/p1-02-sign-in-and-out.md)) and `Icon` in
  the name check ([p1-04](/tasks/p1-04-registration.md)).
