---
type: SQLite Table
title: images
description: Pictures staff upload, such as the top stories of news, with their format, bytes and size.
resource: packages/store/schema/images.schema.sql
tags: [store, table, images]
timestamp: 2026-11-04T16:10:00+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | | Names the picture in its address, `/news/images/<id>.<format>` | primary key |
| `format` | TEXT | no | | `png` or `gif` | CHECK |
| `data` | BLOB | no | | The bytes, re-encoded when uploaded | |
| `width` | INTEGER | no | | Pixels, above 0 | CHECK |
| `height` | INTEGER | no | | Pixels, above 0 | CHECK |
| `created_at` | DATETIME | no | | When it was uploaded (UTC) | |
| `created_by_user_id` | INTEGER | yes | | The staff member who uploaded it | → `users.id` ON DELETE SET NULL |

# Keys

- Primary key `id`.
- `news_articles.image_id` refers to it, so an image an article shows cannot be deleted.

# Related

- Entity: [Image](/entities/image.md).
- Queries: [images.query.sql](/queries/images.md).
