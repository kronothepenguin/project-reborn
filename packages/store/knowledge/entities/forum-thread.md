---
type: Entity
title: Forum thread
description: A thread of the site-wide discussion board with its BBCode posts.
tags: [store, entity, forums]
timestamp: 2026-11-05T22:07:34+00:00
---

# Definition

The discussion board is site-wide, as in Holo. A thread starts with its first post; replies are more posts.

# Invariants

- Every thread has at least one post (the opening post is written in the same transaction as the thread).
- Locked threads take no new posts.
- Post counts and the last post are queried from `forum_posts`, never stored.
- Only the author or a user with `forum.edit` edits or deletes a post.

# Lifecycle

- Created with its first post; `views` grows on every load of its page, reloads included (0094).
- The board lists every sticky thread on each page, then 10 other threads, each list by its newest post; the pages
  are counted from the threads that are not sticky (0088).
- Users with `forum.edit` rename, lock, pin or delete threads.
- Deleting a post that was the thread's last deletes the thread; deleting a thread deletes its posts; reports pointing
  at a deleted post keep the ticket.
- A habbo's message count is the posts it has on the board now, so deleted posts leave it.
- An archived habbo's posts stay, and it shows as archived wherever the board names it (0089).

# Vocabularies

None.

# Relations

- Written by [habbos](/entities/habbo.md); posts can be reported as [help tickets](/entities/help-ticket.md).

# Tables

- [forum_threads](/tables/forum_threads.md)
- [forum_posts](/tables/forum_posts.md)

# Queries

- [forums.query.sql](/queries/forums.md)
