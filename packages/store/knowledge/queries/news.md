---
type: SQL Query
title: news.query.sql
description: News operations to write, edit and delete articles, and to list the archive, the newest ones and a category's.
resource: packages/store/queries/news.query.sql
tags: [store, query, news]
timestamp: 2026-11-04T16:10:00+00:00
---

# Operations

## CreateNewsArticle

- Cardinality: `:one`
- Inputs: `avatar_id` (nullable author), `title`, `category`, `image_url`, `image_id` (the uploaded picture `image_url` shows, or NULL), `summary`, `body`, `published_at`, `created_at`, `updated_at`
- Result: the new article
- Tables: `news_articles`

## UpdateNewsArticle

- Cardinality: `:execrows`
- Inputs: `id`, `title`, `category`, `image_url`, `image_id` (nullable), `summary`, `body`, `updated_at`
- Result: changes the article and keeps its author and date, as Holo's editing did
- Tables: `news_articles`

## DeleteNewsArticle

- Cardinality: `:execrows`
- Inputs: `id`
- Tables: `news_articles`

## GetNewsArticle

- Cardinality: `:one`
- Inputs: `id`
- Result: the article, with its `image_id`, and `author`, the name of its habbo, empty when it has none
- Tables: `news_articles`, `avatars`

## ListNewsArticles

- Cardinality: `:many`
- Inputs: none
- Result: every article's id, title, category, summary, date and author name, newest first
- Tables: `news_articles`, `avatars`

## ListLatestNewsArticles

- Cardinality: `:many`
- Inputs: `row_limit`
- Result: the newest articles' id, title, summary, image and date: 10 for the headlines, 4 for the promo
- Tables: `news_articles`

## ListNewsArticlesInCategory

- Cardinality: `:many`
- Inputs: `category`, `row_limit`
- Result: a category's newest articles' id, title and date; Holo listed 25
- Tables: `news_articles`

# Related

- Entity: [News article](/entities/news-article.md).
