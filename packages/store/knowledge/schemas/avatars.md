---
type: SQL Schema File
title: avatars.schema.sql
description: Declares the habbo tables for avatars, their badges and their wardrobe outfits.
resource: packages/store/schema/avatars.schema.sql
tags: [store, schema, habbo]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [avatars](/tables/avatars.md) | table | Habbos: name, figure, gender, motto, owning user |
| `idx_avatars_name` | unique index | One habbo per name, ignoring case |
| `idx_avatars_user_id` | index | Habbos of a user |
| [avatar_badges](/tables/avatar_badges.md) | table | Badges owned by a habbo |
| `idx_avatar_badges_avatar_id_worn` | partial unique index | At most one worn badge per habbo |
| [wardrobe_outfits](/tables/wardrobe_outfits.md) | table | Saved outfits per wardrobe slot |

Entity: [Habbo](/entities/habbo.md).
