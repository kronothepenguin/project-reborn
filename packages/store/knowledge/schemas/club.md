---
type: SQL Schema File
title: club.schema.sql
description: Declares the Habbo Club subscription periods of habbos.
resource: packages/store/schema/club.schema.sql
tags: [store, schema, club]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [club_subscriptions](/tables/club_subscriptions.md) | table | Paid club periods; membership is any period covering now |
| `idx_club_subscriptions_avatar_id_ends_at` | index | Current and latest period of a habbo |

Entity: [Club subscription](/entities/club-subscription.md).
