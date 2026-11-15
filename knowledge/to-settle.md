---
type: Note
title: To settle
description: Lists the code to change and the choices open for the user.
---

Each entry is removed by the task that settles it.

# Code to change

- `packages/store/schema/auth.schema.sql`: the comment on `sso_tickets` says the id is the ticket as text. Source:
  decision server/0030.
- `apps/cms/Makefile`: `.PHONY` drops `web` and `stop`. Source: the Makefile's rules.
- `apps/server/.air.toml` watches every package the server imports, `packages/virtual` and `packages/auth` included.
  Source: the imports of `apps/server`.
- `packages/client-r26/vitest.config.js` drops the include of `src/director/**/__tests__/`. Source: the package's
  folders.
- `tests/e2e/suites/housekeeping-vouchers.mjs`: the check "Create Voucher has … no Type" follows the page, which has
  the Type field. Source: the page, `knowledge/features/economy/spec.md` and HoloCMS.
- Every handler file of `packages/cms`, `packages/housekeeping` and `packages/installer` is renamed with underscores,
  and each of the 36 action routes moves to the file of its own path (`/groups/{id}/join` → `groups_join.go`). Rule:
  `applying-go-patterns`.
- `HandleHomeSearch` → `HandleHomeSearchView` and `HandleGroupsSearch` → `HandleGroupsSearchView`. Rule:
  `applying-go-patterns`, `View` means a page.
- These CMS GET handlers take the name of what they return. Rule: `applying-go-patterns`, a data GET ends in its
  format and a redirect ends in `Redirect`.
  - `HandleForumThreadsSettingsView` → `HandleForumThreadsSettingsJSON`
  - `HandleGroupsInfoView` → `HandleGroupsInfoJSON`
  - `HandleGroupsMembersView` → `HandleGroupsMembersJSON`
  - `HandleGroupsRandomView` → `HandleGroupsRandomJSON`
  - `HandleHomeStoreView` → `HandleHomeStoreJSON`
  - `HandleHomeStoreCategoryView` → `HandleHomeStoreCategoryJSON`
  - `HandleMeGroupsView` → `HandleMeGroupsJSON`
  - `HandleMeInventoryView` → `HandleMeInventoryJSON`
  - `HandleHabboImagingBadgeView` → `HandleHabboImagingBadgeImage`
  - `HandleNewsImagesView` → `HandleNewsImagesImage`
  - `HandleXMLPromoHabbos` → `HandlePromoHabbosXML`
  - `HandleAccountView` → `HandleAccountRedirect`
- `packages/server`: `encoding`, `game`, `transport` and `r26` are imported only inside the module. The master asks
  the user whether they move under `internal/`. Rule: `applying-go-patterns`.
- The tables `furni`, `home_inventory` and `catalogue_item_furni` are renamed `furnis`, `home_inventories` and
  `catalogue_item_furnis`, each through an update file that rebuilds the table, with every query, generated type and
  caller that names it. `avatar_game_data` stays: `data` is a plural. Rule: `adding-data-persistence`.
- Housekeeping's `clock.astro` and `news/news-fields.astro` become Svelte islands: an `.astro` file holds markup only.
  Rules: `building-astro-components`, `adding-svelte-interactivity`.
- The 34 tests of `packages/components` that prove attributes and defaults go: 14 that forward native attributes
  (Button's "forwards native attributes to the element"), 10 that keep a prop off the element ("does not forward
  variant as an attribute") and 10 that check a prop's default (Button's "defaults type to button"). Each primitive
  keeps the tests of what a visitor sees or does. Rule: `building-svelte-primitives`.

- Housekeeping's `box.astro` and `submit.astro` move to the shared components package: a `Box` primitive with the
  `blue` and `gold` title bars and a `plain` variant of `Button`, each with a test and a story. The user chose "In the
  shared package". Rule: `building-svelte-primitives`.
- Housekeeping's `group-fields.astro` moves to the folder of the feature it is about, access groups. Rule:
  `building-astro-components`.
- The CMS's `account/settings-frame.astro` is a body layout that renders `community.astro`: it moves to
  `src/layouts/`. Rule: `building-astro-components`.
- The CMS's `credits/transactions-table.astro` builds its own `<table>`: it uses the shared `Table` primitive. Rule:
  `building-astro-components`.

# Open choices

- Should `tools/create` give a new project a `knowledge/` folder and the short README (what it is, setup)?
- Old tests: slaves sort them into three groups (proves a behaviour of a spec; proves only the database or a
  generator; proves nothing a spec says), and the user decides by group which go.
