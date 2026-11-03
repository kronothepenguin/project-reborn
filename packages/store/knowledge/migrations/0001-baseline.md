---
type: SQL Update
title: 0001-baseline.sql
description: Creates every table and index of the schema files as they were before updates existed, so a database created then passes through it unchanged.
resource: packages/store/migrations/0001-baseline.sql
tags: [store, update]
timestamp: 2026-11-03T21:44:27+00:00
---

# Update

| | |
|---|---|
| Title | The hotel's tables as they were before updates existed. |
| Automatic | no |

Creates every table and index of these schema files as they were on 2026-11-03, each with `IF NOT EXISTS`:
[access](/schemas/access.md), [auth](/schemas/auth.md), [avatars](/schemas/avatars.md), [club](/schemas/club.md), [economy](/schemas/economy.md), [forums](/schemas/forums.md), [groups](/schemas/groups.md), [homes](/schemas/homes.md), [home-store](/schemas/home-store.md), [moderation](/schemas/moderation.md), [news](/schemas/news.md), [profiles](/schemas/profiles.md), [referrals](/schemas/referrals.md), [settings](/schemas/settings.md), [site](/schemas/site.md), [users](/schemas/users.md).

A database that `store.Open` created before updates existed already has all of them, so the update changes nothing on it
and only records it in [migrations](/tables/migrations.md).
