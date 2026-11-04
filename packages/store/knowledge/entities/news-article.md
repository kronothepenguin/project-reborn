---
type: Entity
title: News article
description: A news article written by staff, shown on the news pages and the news promo.
tags: [store, entity, news]
timestamp: 2026-11-04T01:38:16+00:00
---

# Definition

News articles have a headline, a category, a top-story image, a plain-text summary and a BBCode body rendered by the
CMS.

# Invariants

- The body is BBCode, never raw HTML.
- Only users with `housekeeping.news` create, edit or delete articles.

# Lifecycle

- Written, edited and deleted from housekeeping; listed newest first by `published_at`, then by id.
- Editing keeps the author and the date, as Holo's did.
- `image_url` is one of the CMS's top-story images, an http(s) address, or an uploaded [image](/entities/image.md).

# Vocabularies

| Column | Values |
|--------|--------|
| `category` | chosen in housekeeping; Holo offered a fixed list (News, Updates, Events & Competitions, …) |

# Relations

- Authored by a [habbo](/entities/habbo.md).

# Tables

- [news_articles](/tables/news_articles.md)

# Queries

- [news.query.sql](/queries/news.md)
