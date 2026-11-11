---
type: SQLite Table
title: furni_definitions
description: What a furni is: its sprite, where it stands, its size, height and colours, a wall item's data, and whether it is a door, tradeable and recyclable.
resource: packages/store/schema/catalogue.schema.sql
tags: [store, table, catalogue]
timestamp: 2026-11-11T15:49:58+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | | Definition; a seeded one keeps the id of Holo's first row for it | primary key |
| `sprite` | TEXT | no | | The furni's class for the client, with the client's own variant after a `*`, such as `rare_parasol*0` | |
| `kind` | TEXT | no | | Where it stands: `wall`, `solid`, `seat`, `bed` or `rug` | CHECK closed set |
| `length` | INTEGER | no | 0 | A floor furni's first size in tiles; 0 for a wall item | CHECK ≥ 0 |
| `width` | INTEGER | no | 0 | A floor furni's second size in tiles; 0 for a wall item | CHECK ≥ 0 |
| `height` | REAL | no | 0 | How high a floor furni's top is, where a habbo sits or the next furni stands | CHECK ≥ 0 |
| `colours` | TEXT | no | `''` | A floor furni's part colours, as the client reads them | |
| `data` | TEXT | no | `''` | What a wall item carries: a poster's number | |
| `door` | BOOLEAN | no | FALSE | Opens to let habbos through, as a gate does | |
| `tradeable` | BOOLEAN | no | TRUE | May change hands in a trade | |
| `recyclable` | BOOLEAN | no | TRUE | May be given to the recycler | |

# Keys

- Primary key `id`; `idx_furni_definitions_sprite` (`sprite`).

# Notes

- Several definitions share a sprite: the five colours of `bed_budgetb` are five definitions. Nothing makes a sprite
  unique.
- The update [0013-catalogue.sql](/migrations/0013-catalogue.md) seeds Holo's 1,256 furni
  (`plans/server/decisions/0091-holos-catalogue-changed-by-updates.md`).

# Related

- Entity: [Furni definition](/entities/furni-definition.md).
- Queries: [catalogue.query.sql](/queries/catalogue.md).
