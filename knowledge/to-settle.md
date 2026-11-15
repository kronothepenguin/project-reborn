---
type: Note
title: To settle
description: Lists what the move to OKF + Skills found, for the user to decide.
---

Each entry is settled by the user, then removed from this file.

# Skill rules the code departs from

For each rule, the user says whether the rule changes or the code does.

Frontend:

- `building-astro-components`: `src/components` stays flat. The CMS and housekeeping use a sub-folder per feature.
- `building-astro-components`: a page imports its body layout. `maintenance.astro` of the CMS and `update-failed.astro`
  of the CMS and housekeeping import the document layout.
- `building-astro-components`: an `.astro` file holds no client behaviour. Housekeeping's `clock.astro` and
  `news/news-fields.astro` carry inline scripts.
- `templating-astro-pages`: pages exist for GET routes. Some pages are templates other handlers answer with:
  `maintenance`, `update-failed`, `not-found`, `banned`.
- `building-astro-components`: layouts stay `.astro`. They do, and the CMS layouts `community.astro` and
  `help-tool.astro` render Svelte islands: may a layout host islands?

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
- These CMS GET handlers return data and take the name of what they return: `HandleForumThreadsSettingsView`,
  `HandleGroupsInfoView`, `HandleGroupsMembersView`, `HandleGroupsRandomView`, `HandleHomeStoreView`,
  `HandleHomeStoreCategoryView`, `HandleMeGroupsView`, `HandleMeInventoryView` (JSON), `HandleHabboImagingBadgeView`
  and `HandleNewsImagesView` (images). The user names the form of each new name.
- `packages/server`: its public folders `game`, `encoding`, `transport` and `r26`. The official layout puts supporting
  packages in `internal/` first. The master asks the user which of them other modules may import.
- The tables `furni` and `home_inventory` are renamed `furnis` and `home_inventories`, each through an update file that
  rebuilds the table, with every query, generated type and caller that names it. `avatar_game_data` stays: `data` is a
  plural. Rule: `adding-data-persistence`.
