---
type: SQLite Table
title: catalogue_items
description: What a catalogue page sells: its place on the page, its name, description and price in credits.
resource: packages/store/schema/catalogue.schema.sql
tags: [store, table, catalogue]
timestamp: 2026-11-11T15:49:58+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | | Item; a seeded one keeps the id of Holo's row | primary key |
| `catalogue_page_id` | INTEGER | no | | The page that sells it | → `catalogue_pages.id`, cascade |
| `position` | INTEGER | no | | Its place on the page, lowest first | |
| `code` | TEXT | no | | The item's purchase code for the client, which sends it back to buy the item and shows the picture `ctlg_pic_<code>` when its cast holds one | unique |
| `name` | TEXT | no | | Name the page shows | |
| `description` | TEXT | no | `''` | Description the page shows | |
| `price` | INTEGER | no | | Credits it costs | CHECK ≥ 0 |

# Keys

- Primary key `id`; unique `code`; `idx_catalogue_items_catalogue_page_id` (`catalogue_page_id`).

# Notes

- Two items of a page may share a `position`, as three of Holo's do; the id then orders them.
- A seeded furni's code is its id, and a seeded deal's is Holo's, such as `deal97`, for which the client has a picture.

# Related

- Entity: [Catalogue item](/entities/catalogue-item.md).
- Queries: [catalogue.query.sql](/queries/catalogue.md).
