---
type: SQLite Table
title: recyclings
description: A habbo's recycling, one at a time: when it started and the furni it brings.
resource: packages/store/schema/recycler.schema.sql
tags: [store, table, recycler]
timestamp: 2026-11-12T01:11:06+00:00
---


# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `avatar_id` | INTEGER | no | | The habbo that recycles | primary key, → `avatars.id`, cascade |
| `furni_definition_id` | INTEGER | no | | The reward it brings | → `furni_definitions.id` |
| `started_at` | DATETIME | no | | When the recycling started (UTC) | |

# Keys

- Primary key `avatar_id`: a habbo has one recycling at a time.

# Notes

- The furni the habbo gave are the rows of [furni](/tables/furni.md) whose `recycler_avatar_id` is the habbo.
- When the habbo goes, its recycling goes, and the furni that waited lose their `recycler_avatar_id`: they are in their
  user's shared inventory.

# Related

- Entity: [Recycling](/entities/recycling.md).
- Queries: [recycler.query.sql](/queries/recycler.md).
