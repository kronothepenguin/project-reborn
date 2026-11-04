---
type: SQL Update
title: 0006-news-image-links.sql
description: Links each news article to the uploaded picture it shows, so that a picture in use cannot be deleted, and fills the link for the articles that show one.
resource: packages/store/migrations/0006-news-image-links.sql
tags: [store, update, news, images]
timestamp: 2026-11-04T16:10:00+00:00
---

# Update

| | |
|---|---|
| Title | A link from each news article to the uploaded picture it shows, so that a picture in use cannot be deleted. |
| Automatic | no |

Adds `image_id` to [news_articles](/tables/news_articles.md), a reference to [images](/tables/images.md) with
SQLite's default action, and its index `idx_news_articles_image_id`. It links each article whose `image_url` is an
uploaded picture's address, `/news/images/<id>.<format>`, to that picture. Sign-in never reads it, so the update waits
for an administrator.
