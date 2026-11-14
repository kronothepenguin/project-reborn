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

Data and config:

- `adding-data-persistence`: mutations use the `:exec` forms. Many use `:one` with `RETURNING` (`CreateUser`,
  `SpendSSOTicket`, `RedeemVoucher`).
- `adding-data-persistence`: every list read has `ORDER BY`. `RemoveAllRoomRights :many` is a `DELETE … RETURNING`
  without one.
- `adding-data-persistence`: table names are plural. `furni`, `home_inventory` and `avatar_game_data` are mass nouns.
- `adding-data-persistence`: a foreign key is named `<table>_id`. `room_categories.parent_id` is shorter.
- `adding-data-persistence`: `CHECK` is for closed sets. The schema also checks across columns
  (`ends_at > starts_at`) and ranges.
- `adding-data-persistence`: times come from Go. Update files write times with `strftime(…, 'now')`, as
  `packages/store/knowledge/database-updates.md` prescribes.
- `adding-config-sections`: `config.json` is written only when absent. `config.Rewrite` rewrites it from
  housekeeping's update page.
- `adding-config-sections`: every field has `Default<Field>()` and `Validate<Field>()`. `packages/config/server`
  nests a `Connection` and reuses `cms.ValidateHost`.

Go:

- `applying-go-patterns`: one handler file per route, its static segments joined. 36 routes that end in an action
  live in their resource's file (`/groups/{id}/join` in `groups.go`).
- `applying-go-patterns`: the rule is silent on a mount prefix. Housekeeping's handler files drop `/housekeeping`.
- `applying-go-patterns`: a GET handler is named `View`. `HandleHomeSearch`, `HandleGroupsSearch` and
  `HandleXMLPromoHabbos` are named otherwise.
- `applying-go-patterns`: `Deps` holds narrow interfaces declared by the consumer. The apps' `Deps` hold `*sql.DB`
  and `*store.Queries`.
- `applying-go-patterns`: shared services go through `Deps`. Handlers call the package-level `settings` and `auth`
  functions, by the user's earlier choice.
- `applying-go-patterns`: a module's public API is its root `<pkg>.go`, the rest in `internal/`. `packages/astro`,
  `auth`, `virtual`, `server` and `config` are laid out otherwise.
- `applying-go-patterns`: every runner has `cmd/<app>-dev`. `apps/server` has `cmd/server` only.
- `reviewing-effective-go`: library code returns errors in place of panics. `New` panics in the CMS and housekeeping,
  as `store.Must` does, on purpose.
- `reviewing-effective-go`: a web server takes its address from `flag`. Ports come from `config.json`.
- `reviewing-effective-go`: names a review flags: `cms.CMS`, `housekeeping.Housekeeping`, `installer.Installer`, and
  the `Get` prefix of `config.Get`, `settings.GetInt` and the generated queries.

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
- Old tests that prove no behaviour of a spec: the user reviews them against the specs, and decides which go.
