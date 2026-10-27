---
type: SQL Schema File
title: homes.schema.sql
description: Declares the home pages of profiles and groups and the items placed on them.
resource: packages/store/schema/homes.schema.sql
tags: [store, schema, homes]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [homes](/tables/homes.md) | table | A home page owned by exactly one profile or one group |
| `idx_homes_profile_id`, `idx_homes_group_id` | unique indexes | At most one home per profile and per group |
| [home_items](/tables/home_items.md) | table | Stickers, notes and widgets placed on a home |
| `idx_home_items_home_id` | index | Items of a home |

Entity: [Home](/entities/home.md).
