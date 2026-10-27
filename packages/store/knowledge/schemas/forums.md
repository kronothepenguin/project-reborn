---
type: SQL Schema File
title: forums.schema.sql
description: Declares the site-wide discussion board threads and posts.
resource: packages/store/schema/forums.schema.sql
tags: [store, schema, forums]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [forum_threads](/tables/forum_threads.md) | table | Threads with sticky and locked flags and a view counter |
| `idx_forum_threads_created_at` | index | Threads by age |
| [forum_posts](/tables/forum_posts.md) | table | BBCode posts of a thread |
| `idx_forum_posts_forum_thread_id_created_at` | index | Posts of a thread in order; last post per thread |
| `idx_forum_posts_avatar_id` | index | Post count of a habbo |

Entity: [Forum thread](/entities/forum-thread.md).
