---
type: Entity
title: Forum thread
description: A thread of the site-wide discussion board with its BBCode posts.
tags: [store, entity, forums]
timestamp: 2026-10-27T21:28:26+00:00
---

# Definition

The discussion board is site-wide, as in Holo. A thread starts with its first post; replies are more posts.

# Invariants

- Every thread has at least one post (the opening post is written in the same transaction as the thread).
- Locked threads take no new posts.
- Post counts and the last post are queried from `forum_posts`, never stored.
- Only the author or a user with `forum.edit` edits or deletes a post.

# Lifecycle

- Created with its first post; `views` grows on each view.
- Users with `forum.edit` rename, lock, pin or delete threads.
- Deleting a thread deletes its posts; reports pointing at a deleted post keep the ticket.

# Vocabularies

None.

# Relations

- Written by [habbos](/entities/habbo.md); posts can be reported as [help tickets](/entities/help-ticket.md).

# Tables

- [forum_threads](/tables/forum_threads.md)
- [forum_posts](/tables/forum_posts.md)
