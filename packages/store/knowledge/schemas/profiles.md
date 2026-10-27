---
type: SQL Schema File
title: profiles.schema.sql
description: Declares the habbo profiles and their tags.
resource: packages/store/schema/profiles.schema.sql
tags: [store, schema, profiles]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [profiles](/tables/profiles.md) | table | One web profile per habbo, the anchor of its home and tags |
| `idx_profiles_avatar_id` | unique index | One profile per habbo |
| [profile_tags](/tables/profile_tags.md) | table | Tags a habbo put on its profile |
| `idx_profile_tags_tag` | index | Profiles with a tag (tag search, tag cloud) |

Entity: [Profile](/entities/profile.md).
