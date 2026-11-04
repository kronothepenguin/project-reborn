---
type: Entity
title: Image
description: A picture staff upload, such as a news top story, kept in the database and served by the CMS at an address of its own.
tags: [store, entity, images]
timestamp: 2026-11-04T01:38:16+00:00
---

# Definition

An image is a picture that staff upload in housekeeping. News articles point at it with an `image_url` of the form
`/news/images/<id>.<format>`, which the CMS serves.

# Invariants

- `format` is `png` or `gif`, and the bytes are re-encoded when uploaded, so nothing hidden rides along.
- A stored image never changes, so browsers may keep it.

# Lifecycle

- Uploaded from housekeeping's news form.
- Kept in the database, so its copies carry it.

# Vocabularies

| Column | Values |
|--------|--------|
| `format` | `png`, `gif` |

# Relations

- Uploaded by a [user](/entities/user.md).

# Tables

- [images](/tables/images.md)

# Queries

- [images.query.sql](/queries/images.md)
