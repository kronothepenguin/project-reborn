---
type: SQL Update
title: 0005-images.sql
description: Creates the images table for the pictures staff upload, such as the top stories of news.
resource: packages/store/migrations/0005-images.sql
tags: [store, update, images]
timestamp: 2026-11-04T01:38:16+00:00
---

# Update

| | |
|---|---|
| Title | A table for the pictures that staff upload, such as the top stories of news. |
| Automatic | no |

Creates [images](/tables/images.md). Sign-in never reads it, so the update waits for an administrator.
