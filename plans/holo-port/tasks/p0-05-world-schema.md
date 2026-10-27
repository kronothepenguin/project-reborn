---
type: Task
title: Write the world schema
description: Schema files and OKF concepts for profiles, homes, the home store, groups, economy, club, forums, news, moderation and site.
status: done
phase: p0
depends_on: [p0-04]
packages: [packages/store]
holo: [source/holo/install.php, source/holo/upgrade.php, source/holo/web-gallery/v2/styles/cms_homes_catalouge.sql]
timestamp: 2026-10-27T21:32:36+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-27T21:32:36+00:00"}
---

# Goal

The rest of the [new schema](/reference/holo-database.md#new-schema) exists from P0 on, because SQLite refuses to
write a child row while a foreign-key parent table is missing, and the installer writes `homes` rows in P0.

# Steps

- [x] `profiles.schema.sql`: `profiles`, `profile_tags`.
- [x] `homes.schema.sql`: `homes`, `home_items`.
- [x] `home-store.schema.sql`: `home_store_categories`, `home_store_items`, `home_inventory`.
- [x] `groups.schema.sql`: `groups`, `group_members`.
- [x] `economy.schema.sql`: `wallets`, `wallet_transactions`, `vouchers`.
- [x] `club.schema.sql`: `club_subscriptions`.
- [x] `forums.schema.sql`: `forum_threads`, `forum_posts`.
- [x] `news.schema.sql`: `news_articles`.
- [x] `moderation.schema.sql`: `bans`, `alerts`, `help_tickets`, `staff_logs`.
- [x] `site.schema.sql`: `banners`.
- [x] OKF: `schemas/`, `tables/` and `entities/` concepts (Profile, Home, Home store, Wallet, Club subscription,
      Group, Forum thread, News article, Ban, Alert, Help ticket, Staff log) and their indexes.
- [x] Confirm sqlc accepts the `groups` table name; quote it if generation fails.

# Verification

```sh
cd packages/store && go tool sqlc generate && go vet ./... && go test ./... && make check-docs
```

A test inserts a user, a habbo, a profile and its home in one transaction on a fresh database.

Results (2026-10-27T21:32:36+00:00):

- `go tool sqlc generate` succeeds with no quoting: `groups`, the `action` column and the `COLLATE NOCASE`
  primary key of `vouchers` all parse. `models.go` has 35 table structs, and a second generation is byte-identical.
- `gofmt -l .` and `go vet ./...`: no output. `go test ./... -race -count=1`: ok (26 tests).
- `make check-docs`: exit 0.
- `TestRegistrationRowsCommitInOneTransaction` writes a user, a habbo, a profile, its home, a wallet and a ledger row
  in one transaction on a fresh database and commits.
- The other new tests in `world_schema_test.go` check the constraints the design relies on:
  - a home has exactly one owner, and one per profile;
  - a habbo has at most one favourite group;
  - deleting a group deletes its home and members;
  - credits cannot go negative;
  - a store item in an inventory cannot be deleted;
  - voucher codes match ignoring case;
  - a ban needs a user or an IP;
  - a club period must end after it starts.
- Hand checks on the knowledge bundle:
  - 16 schema files, 35 tables and 20 entities each have their concept;
  - every concept is listed in its index;
  - every bundle-absolute link resolves;
  - all 74 frontmatter blocks parse;
  - every entity has a `# Tables` section.

# Notes

Choices the approved table left open, made here:

- References to `home_store_items` (from `home_items`, `home_inventory` and `homes.background_home_store_item_id`)
  have no `ON DELETE` clause. An item in use cannot be deleted; housekeeping disables it with `enabled` instead.
- `vouchers.code` is `COLLATE NOCASE`, as Holo's MySQL compared codes case-insensitively.
- `bans.user_id` is `ON DELETE CASCADE`: with `SET NULL`, deleting the user of a user-only ban would break the
  "user or IP" check.
- `club_subscriptions` checks `ends_at > starts_at`.
- Authors, reporters and staff actors (`forum_threads.avatar_id`, `forum_posts.avatar_id`,
  `news_articles.avatar_id`, `help_tickets.avatar_id`, `staff_logs.user_id`) are nullable with `SET NULL`, so the
  content outlives the account.
- `idx_profiles_avatar_id`, `idx_homes_profile_id` and `idx_homes_group_id` implement the UNIQUE constraints of
  the reference table.

Beyond the listed entities:

- A Banner entity was added so the `banners` table has an entity concept like every other table.
- The `users` and `avatars` table concepts and the User and Habbo entities now link the world tables.
- The open vocabularies are written in the entities and come from Holo:
  - home item kinds, widgets and skins;
  - store item kinds;
  - group access and roles;
  - ledger reasons;
  - the staff-log action naming pattern.
- [The schema reference](/reference/holo-database.md#new-schema) now shows the case-insensitive voucher code and the
  club period check.
