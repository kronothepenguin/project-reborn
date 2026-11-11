---
type: SQLite Table
title: catalogue_page_texts
description: A numbered text of a catalogue page, which the page's layout places.
resource: packages/store/schema/catalogue.schema.sql
tags: [store, table, catalogue]
timestamp: 2026-11-11T15:49:58+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `catalogue_page_id` | INTEGER | no | | The page | primary key; → `catalogue_pages.id`, cascade |
| `number` | INTEGER | no | | The text's number, the client's `t<n>`, which orders a page's texts | primary key; CHECK > 0 |
| `text` | TEXT | no | | The text; `<br>` breaks a line | |

# Keys

- Primary key (`catalogue_page_id`, `number`).

# Related

- Entity: [Catalogue page](/entities/catalogue-page.md).
- Queries: [catalogue.query.sql](/queries/catalogue.md).
