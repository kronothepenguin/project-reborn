---
type: SQLite Table
title: catalogue_item_furni
description: The furni a catalogue item gives: one piece of one furni, or the several of a deal.
resource: packages/store/schema/catalogue.schema.sql
tags: [store, table, catalogue]
timestamp: 2026-11-11T15:49:58+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `catalogue_item_id` | INTEGER | no | | The item | primary key; → `catalogue_items.id`, cascade |
| `furni_definition_id` | INTEGER | no | | The furni it gives | primary key; → `furni_definitions.id` |
| `amount` | INTEGER | no | 1 | How many pieces of that furni | CHECK > 0 |

# Keys

- Primary key (`catalogue_item_id`, `furni_definition_id`); `idx_catalogue_item_furni_furni_definition_id`
  (`furni_definition_id`).

# Notes

- A furni definition that an item gives cannot be deleted.

# Related

- Entities: [Catalogue item](/entities/catalogue-item.md) and [Furni definition](/entities/furni-definition.md).
- Queries: [catalogue.query.sql](/queries/catalogue.md).
