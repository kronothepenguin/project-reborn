---
type: SQL Schema File
title: catalogue.schema.sql
description: Declares the furni definitions and the catalogue: its pages, their numbered texts, its items and the furni each item gives.
resource: packages/store/schema/catalogue.schema.sql
tags: [store, schema, catalogue]
timestamp: 2026-11-11T15:49:58+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [furni_definitions](/tables/furni_definitions.md) | table | What each furni is |
| `idx_furni_definitions_sprite` | index | The definitions of a sprite |
| [catalogue_pages](/tables/catalogue_pages.md) | table | The catalogue's pages |
| [catalogue_page_texts](/tables/catalogue_page_texts.md) | table | A page's numbered texts |
| [catalogue_items](/tables/catalogue_items.md) | table | What a page sells |
| `idx_catalogue_items_catalogue_page_id` | index | A page's items |
| [catalogue_item_furni](/tables/catalogue_item_furni.md) | table | The furni an item gives |
| `idx_catalogue_item_furni_furni_definition_id` | index | The items that give a furni |

Entities: [Furni definition](/entities/furni-definition.md), [Catalogue page](/entities/catalogue-page.md) and
[Catalogue item](/entities/catalogue-item.md).
