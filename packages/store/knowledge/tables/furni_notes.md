---
type: SQLite Table
title: furni_notes
description: What a habbo wrote on a post-it that hangs on a wall, one row per post-it that was written on.
resource: packages/store/schema/furni.schema.sql
tags: [store, table, furni]
timestamp: 2026-11-11T18:05:11+00:00
---


# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `furni_id` | INTEGER | no | | The post-it | primary key, → `furni.id`, cascade |
| `text` | TEXT | no | | What is written on it, its line breaks as carriage returns | |

# Keys

- Primary key `furni_id`.

# Notes

- A post-it nobody wrote on has no row, and reads as empty.
- The post-it's colour is its furni's `state`.
- The text goes with its post-it: the key cascades.

# Related

- Entity: [Furni](/entities/furni.md).
- Queries: [furni.query.sql](/queries/furni.md).
