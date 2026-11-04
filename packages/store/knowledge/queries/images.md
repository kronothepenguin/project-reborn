---
type: SQL Query
title: images.query.sql
description: Image operations to store an uploaded picture and to read it back for serving.
resource: packages/store/queries/images.query.sql
tags: [store, query, images]
timestamp: 2026-11-04T01:38:16+00:00
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

# Related

- Entity: [Image](/entities/image.md).
