---
type: Task
title: Add the P1 primitives
description: Add Checkbox, Select, Notice and Avatar to packages/components and move Icon there from packages/cms, each with a story, a test and an export.
status: done
phase: p1
depends_on: []
packages: [packages/components, packages/cms, packages/astro]
holo: [source/holo/web-gallery/v2/styles/style.css, source/holo/web-gallery/v2/styles/registration.css]
timestamp: 2026-10-30T21:54:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:54:29+00:00"}
---

# Goal

Give the P1 pages the small components they share, as primitives in `packages/components`.

# Steps

- [x] `Checkbox` and `Select`, for the login and registration forms and the birth-date selects.
- [x] `Notice` with the variants red, green, orange, blue and darkgray, from Holo's `div.rounded-*` and
      `flash-message` (`style.css:2088-2178`). Colours come from [colours](/reference/colours.md), and
      `tools/tw-color` answers for any colour not listed.
- [x] `Avatar` with `imagingUrl`, `figure`, `size`, `direction`, `headDirection` and `gesture`, as
      [0008](/decisions/0008-configurable-avatar-imaging.md) describes. It joins the URL without encoding it, so that
      `[[ ]]` placeholders survive the build and `html/template` escapes the values at runtime.
- [x] `Icon`: move `packages/cms/src/components/icon.svelte` and its sprite `button_icons2.png`, and update
      `register.astro`.
- [x] Each primitive has a story and a test and is exported from `src/index.ts`, copying `paper.svelte`,
      `paper.test.ts` and `paper.stories.ts`.
- [x] `packages/astro`: the resolvers remove the `<!>` marker that Svelte leaves in a `<select>` with snippet options, found
      while checking `Select` through the real build.

# Verification

```sh
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
pnpm --filter @project-reborn/components build-storybook
pnpm --filter @project-reborn/cms build
```

The tests include one showing that `Avatar` keeps a `[[ .Figure ]]` placeholder in its `src`.

Results (2026-10-30T21:54:29+00:00):

- `pnpm --filter @project-reborn/components test`: 112 tests pass in 18 files, 30 of them new.
- `svelte-check` reports no errors or warnings, and Storybook and the CMS build.
- `gofmt`, `go vet` and `go test -race` pass in `packages/astro`. `go vet` and `go test -race` pass in the packages
  that use it: `packages/cms`, `packages/installer`, `apps/cms` and `apps/installer`.
- Real build, with a throwaway page that was not kept: all five primitives went through `astro build` and Go's
  `html/template`.
  - `[[ ]]` placeholders survive in text, in attributes, in `Avatar`'s `src` and around `[[ range ]]` options.
  - A `<script>` payload and a quoted name came out escaped, and a hostile figure came out URL-encoded in the `src`.
- Mutation checks: each of these, applied on purpose, failed a test:
  - the `background` shorthand in `Icon`;
  - `{...rest}` after `type` in `Checkbox`;
  - keeping the `<!>` marker in the resolvers.
- Storybook screenshots show every variant, and `Avatar` gets a real image from the habbo.com imager.

# Notes

- `Icon` keeps Holo's seven names from `buttons.css`. `save`, `cancel` and `edit` are white in the sprite, for coloured
  buttons, so they need a coloured background to be seen. `purse` is a black check mark, which Holo used on the voucher
  submit button.
- The sprite is 285 bytes, so Vite inlines it in the CSS and `button_icons2` does not appear in `dist`.
- `Icon` is hidden from assistive technology, so an icon-only button needs an `aria-label`. The name check button in
  `register.astro` has none yet; [p1-04](/tasks/p1-04-registration.md) replaces it.
- `Checkbox` puts `class` on its label, which is what a page lays out. Everything else goes to the input.
- `Checkbox` forwards `{...rest}` before `type`, so that a page cannot turn it into another input; TypeScript does not
  check `.astro` files.
- `Select` takes its options as children, so that Go can render them with `[[ range ]]`. Svelte treats such a `<select>`
  as rich content and appends a `<!>` hydration marker that `html/template` would escape into text. These pages are
  never hydrated, so the resolvers drop the marker.
- `Avatar` offers the sizes `s` and `b`, the two Holo used.
