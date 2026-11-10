---
type: SQL Query
title: forums.query.sql
description: Forum operations for the board's pages with every sticky on each, a thread's pages of posts with their habbos, writing, editing and deleting posts and threads, thread settings, views and a habbo's last post.
resource: packages/store/queries/forums.query.sql
tags: [store, query, forums]
timestamp: 2026-11-05T22:07:34+00:00
---

# Operations

## CreateForumThread

- Cardinality: `:one`
- Inputs: `avatar_id` (the opener), `title`, `created_at`
- Result: the new thread; its first post is written in the same transaction with `CreateForumPost`
- Tables: `forum_threads`

## CreateForumPost

- Cardinality: `:one`
- Inputs: `forum_thread_id`, `avatar_id`, `body`, `created_at`
- Result: the new post
- Tables: `forum_posts`

## GetForumThread

- Cardinality: `:one`
- Inputs: `id`
- Result: the thread
- Tables: `forum_threads`

## CountForumThreadView

- Cardinality: `:exec`
- Inputs: `id`
- Result: adds one view, on every load of the thread (0094)
- Tables: `forum_threads`

## UpdateForumThread

- Cardinality: `:execrows`
- Inputs: `id`, `title`, `sticky`, `locked`
- Tables: `forum_threads`

## DeleteForumThread

- Cardinality: `:execrows`
- Inputs: `id`
- Result: deletes the thread and, through the cascade, its posts
- Tables: `forum_threads`, `forum_posts`

## DeleteEmptyForumThread

- Cardinality: `:execrows`
- Inputs: `id`
- Result: deletes the thread only when it has no posts left, after its last post was deleted
- Tables: `forum_threads`, `forum_posts`

## GetForumPost

- Cardinality: `:one`
- Inputs: `id`
- Result: the post
- Tables: `forum_posts`

## EditForumPost

- Cardinality: `:execrows`
- Inputs: `id`, `body`, `edited_at`, `edited_by_avatar_id`
- Result: the new body, with the time and the habbo of the edit
- Tables: `forum_posts`

## DeleteForumPost

- Cardinality: `:execrows`
- Inputs: `id`
- Tables: `forum_posts`

## GetLastForumPostAt

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: the time of the habbo's newest post, which the spam check measures from (0091); not found without posts
- Tables: `forum_posts`

## CountAvatarForumPosts

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: the posts the habbo has on the board, its `Messages:`
- Tables: `forum_posts`

## CountForumThreads

- Cardinality: `:one`
- Inputs: none
- Result: the threads that are not sticky, from which the board counts its pages (0088)
- Tables: `forum_threads`

## ListForumThreads

- Cardinality: `:many`
- Inputs: `sticky`, `row_limit` (-1 for every row), `row_offset`
- Result: the sticky threads, or a page of the others, newest post first; each with its title, flags, views and
  date, the opener's name, the newest post's time and habbo's name, and the replies (the posts after the first). A
  habbo that is archived carries its `archived_at` (0089).
- Tables: `forum_threads`, `forum_posts`, `avatars`

## CountForumPosts

- Cardinality: `:one`
- Inputs: `forum_thread_id`
- Result: the thread's posts, from which its pages are counted
- Tables: `forum_posts`

## ListForumPosts

- Cardinality: `:many`
- Inputs: `forum_thread_id`, `row_limit`, `row_offset`
- Result: a page of the thread's posts, oldest first; each with its body, time and edit time, its habbo's id, name,
  figure, motto, the badge of the first slot it fills, favourite group and badge, and the posts that habbo has on the board, and the name of the
  habbo that edited it last. Archived habbos carry their `archived_at`.
- Tables: `forum_posts`, `avatars`, `avatar_badges`, `group_members`, `groups`

# Related

- Entity: [Forum thread](/entities/forum-thread.md).
