---
type: SQL Query
title: images.query.sql
description: Image operations to store an uploaded picture, read it back for serving, list the uploads with the articles that show them, and delete one no article shows.
resource: packages/store/queries/images.query.sql
tags: [store, query, images]
timestamp: 2026-11-04T16:10:00+00:00
---

# Operations

## CreateImage

- Cardinality: `:one`
- Inputs: `format`, `data`, `width`, `height`, `created_at`, `created_by_user_id` (nullable)
- Result: the new image's id
- Tables: `images`

## GetImage

- Cardinality: `:one`
- Inputs: `id`
- Result: the image's format and bytes
- Tables: `images`

## ListImages

- Cardinality: `:many`
- Inputs: none
- Result: every image's id, format, `size` in bytes, date and uploader id, `uploader`, the name of that user's first habbo as the staff log names users, empty when there is none, and `articles`, how many articles show it; newest first
- Tables: `images`, `avatars`, `news_articles`

## ListImageArticles

- Cardinality: `:many`
- Inputs: `image_id`
- Result: the id and title of every article that shows the image, newest first
- Tables: `news_articles`

## DeleteImage

- Cardinality: `:execrows`
- Inputs: `id`
- Result: deletes an image no article shows; the link of `news_articles` refuses the others, an error `store.IsForeignKey` recognizes
- Tables: `images`

# Related

- Entity: [Image](/entities/image.md).
