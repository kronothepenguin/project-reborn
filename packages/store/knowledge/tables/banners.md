---
type: SQLite Table
title: banners
description: Promotional banners with image, link, position and an enabled flag.
resource: packages/store/schema/site.schema.sql
tags: [store, table, site]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Banner id | primary key |
| `title` | TEXT | no | | Alt text and housekeeping label | |
| `image_url` | TEXT | no | | Banner image | |
| `link_url` | TEXT | no | | Link target | |
| `enabled` | BOOLEAN | no | TRUE | Shown on the site | |
| `position` | INTEGER | no | 0 | Display order | |
| `created_at` | DATETIME | no | | Creation time (UTC) | |
| `updated_at` | DATETIME | no | | Last change (UTC) | |

# Keys

- Primary key `id`.

# Related

- Entity: [Banner](/entities/banner.md).
