---
type: SQL Query
title: site.query.sql
description: Banner operations to add, edit and delete banners, and to list all of them or the enabled ones in the order they were added.
resource: packages/store/queries/site.query.sql
tags: [store, query, site]
timestamp: 2026-11-04T01:38:16+00:00
---

# Operations

## CreateBanner

- Cardinality: `:one`
- Inputs: `title`, `image_url`, `link_url`, `enabled`, `created_at`, `updated_at`
- Result: the new banner
- Tables: `banners`

## UpdateBanner

- Cardinality: `:execrows`
- Inputs: `id`, `title`, `image_url`, `link_url`, `enabled`, `updated_at`
- Tables: `banners`

## DeleteBanner

- Cardinality: `:execrows`
- Inputs: `id`
- Tables: `banners`

## GetBanner

- Cardinality: `:one`
- Inputs: `id`
- Tables: `banners`

## ListBanners

- Cardinality: `:many`
- Inputs: none
- Result: every banner by `position`, then in the order they were added, as Holo listed them
- Tables: `banners`

## ListEnabledBanners

- Cardinality: `:many`
- Inputs: none
- Result: the enabled banners in the same order
- Tables: `banners`

# Related

- Entity: [Banner](/entities/banner.md).
