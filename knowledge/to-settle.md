---
type: Note
title: To settle
description: Lists what the move to OKF + Skills found, for the user to decide.
---

Each entry is settled by the user, then removed from this file.

# Found in the code

- `packages/store/schema/auth.schema.sql`: the comment on `sso_tickets` says its id is a SHA-256 digest. The code
  stores the ticket as text (decision server/0030).
- `apps/cms/Makefile`: `.PHONY` lists `web` and `stop`, which have no rule.
- `apps/server/.air.toml` watches `apps/server`, `packages/server`, `packages/config` and `packages/store`. A change
  in `packages/virtual` or `packages/auth` waits for a manual restart of `make dev`.
- `packages/client-r26/vitest.config.js` includes `src/director/**/__tests__/`, a folder the package lacks.
- The `housekeeping-vouchers` browser suite checks "Create Voucher has … no Type". The page has a Type field.
- Staff can alert users above their own level (`TestStaffCanAlertUsersAboveThem`). The old plan said every action
  stops at the actor's level.
- Holo's ranks are seeded by the store update `0003-ranks.sql`. Decision holo-port/0054 says the installer creates
  them.
- The site's header shows `<site> is offline` (`packages/cms/src/components/header/hotel-status.astro`).
- The citation rewrite changed comments in eight update files (`packages/store/migrations/0010`, `0013`–`0016`,
  `0019`–`0021`), which the user's rule says stay as written. Only comments changed.
- Decisions in force that the code has yet to follow, each planned in the `platform` feature: reborn/0006 (settings
  read from the store; the code reloads them every `cms.refresh`), reborn/0008 (releases ship five programs; the
  Makefile builds three), reborn/0004 (the installer's done page goes).

# Open choices

- Should `tools/create` give a new project a `knowledge/` folder and the short README (what it is, setup)?
- Old tests that prove no behaviour of a spec: the user reviews them against the specs, and decides which go. Tests
  that only prove the database or the generator works are the first candidates to go.

# Code to change

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
- `packages/server`: its public folders `game`, `encoding`, `transport` and `r26`. The official layout puts supporting
  packages in `internal/` first. The master asks the user which of them other modules may import.
- The tables `furni`, `home_inventory` and `catalogue_item_furni` are renamed `furnis`, `home_inventories` and
  `catalogue_item_furnis`, each through an update file that rebuilds the table, with every query, generated type and
  caller that names it. `avatar_game_data` stays: `data` is a plural. Rule: `adding-data-persistence`.
- Housekeeping's `clock.astro` and `news/news-fields.astro` become Svelte islands: an `.astro` file holds markup only.
  Rules: `building-astro-components`, `adding-svelte-interactivity`.
- The 34 tests of `packages/components` that prove attributes and defaults go: 14 that forward native attributes
  (Button's "forwards native attributes to the element"), 10 that keep a prop off the element ("does not forward
  variant as an attribute") and 10 that check a prop's default (Button's "defaults type to button"). Each primitive
  keeps the tests of what a visitor sees or does. Rule: `building-svelte-primitives`.
