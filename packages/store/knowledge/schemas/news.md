---
type: SQL Schema File
title: news.schema.sql
description: Declares the news articles written in housekeeping.
resource: packages/store/schema/news.schema.sql
tags: [store, schema, news]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [news_articles](/tables/news_articles.md) | table | Articles with category, image, summary and BBCode body |
| `idx_news_articles_published_at` | index | Latest articles first |

Entity: [News article](/entities/news-article.md).
