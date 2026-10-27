---
type: Entity
title: News article
description: A news article written by staff, shown on the news pages and the news promo.
tags: [store, entity, news]
timestamp: 2026-10-27T21:28:26+00:00
---

# Definition

News articles have a headline, a category, a top-story image, a plain-text summary and a BBCode body rendered by the
CMS.

# Invariants

- The body is BBCode, never raw HTML.
- Only users with `housekeeping.news` create, edit or delete articles.

# Lifecycle

- Written, edited and deleted from housekeeping; listed newest first by `published_at`.

# Vocabularies

| Column | Values |
|--------|--------|
| `category` | chosen in housekeeping; Holo offered a fixed list (News, Updates, Events & Competitions, …) |

# Relations

- Authored by a [habbo](/entities/habbo.md).

# Tables

- [news_articles](/tables/news_articles.md)
