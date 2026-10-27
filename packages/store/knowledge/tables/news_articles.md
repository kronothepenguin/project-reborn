---
type: SQLite Table
title: news_articles
description: News articles written by staff, with category, top-story image, summary and BBCode body.
resource: packages/store/schema/news.schema.sql
tags: [store, table, news]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Article id | primary key |
| `avatar_id` | INTEGER | yes | | Author habbo; NULL once deleted | → `avatars.id` ON DELETE SET NULL |
| `title` | TEXT | no | | Headline | |
| `category` | TEXT | no | | Category name | |
| `image_url` | TEXT | no | `''` | Top-story image | |
| `summary` | TEXT | no | | Plain-text summary | |
| `body` | TEXT | no | | Body in BBCode | |
| `published_at` | DATETIME | no | | Publication time (UTC) | |
| `created_at` | DATETIME | no | | Creation time (UTC) | |
| `updated_at` | DATETIME | no | | Last edit (UTC) | |

# Keys

- Primary key `id`.
- `idx_news_articles_published_at` (`published_at`).

# Related

- Entity: [News article](/entities/news-article.md).
