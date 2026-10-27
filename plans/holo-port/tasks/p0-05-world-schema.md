---
type: Task
title: Write the world schema
description: Schema files and OKF concepts for profiles, homes, the home store, groups, economy, club, forums, news, moderation and site.
status: todo
phase: p0
depends_on: [p0-04]
packages: [packages/store]
holo: [source/holo/install.php, source/holo/upgrade.php, source/holo/web-gallery/v2/styles/cms_homes_catalouge.sql]
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
---

# Goal

The rest of the [new schema](/reference/holo-database.md#new-schema) exists from P0 on, because SQLite refuses to
write a child row while a foreign-key parent table is missing, and the installer writes `homes` rows in P0.

# Steps

- [ ] `profiles.schema.sql`: `profiles`, `profile_tags`.
- [ ] `homes.schema.sql`: `homes`, `home_items`.
- [ ] `home-store.schema.sql`: `home_store_categories`, `home_store_items`, `home_inventory`.
- [ ] `groups.schema.sql`: `groups`, `group_members`.
- [ ] `economy.schema.sql`: `wallets`, `wallet_transactions`, `vouchers`.
- [ ] `club.schema.sql`: `club_subscriptions`.
- [ ] `forums.schema.sql`: `forum_threads`, `forum_posts`.
- [ ] `news.schema.sql`: `news_articles`.
- [ ] `moderation.schema.sql`: `bans`, `alerts`, `help_tickets`, `staff_logs`.
- [ ] `site.schema.sql`: `banners`.
- [ ] OKF: `schemas/`, `tables/` and `entities/` concepts (Profile, Home, Home store, Wallet, Club subscription,
      Group, Forum thread, News article, Ban, Alert, Help ticket, Staff log) and their indexes.
- [ ] Confirm sqlc accepts the `groups` table name; quote it if generation fails.

# Verification

```sh
cd packages/store && go tool sqlc generate && go vet ./... && go test ./... && make check-docs
```

A test inserts a user, a habbo, a profile and its home in one transaction on a fresh database.

# Notes
