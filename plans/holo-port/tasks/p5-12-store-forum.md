---
type: Task
title: Store the forum
description: The store gains the forum's operations, from the board's pages with stickies on every page to threads, posts, edits, deletes, thread settings, views and each habbo's last post, with counts taken from the posts that exist.
status: todo
phase: p5
depends_on: []
packages: [packages/store]
holo: [source/holo/install.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

The CMS reads and writes the board through tested queries ([0088](/decisions/0088-stickies-head-every-page.md),
[0089](/decisions/0089-archived-habbos-show-as-archived.md), [0091](/decisions/0091-forum-spam-check.md),
[0094](/decisions/0094-thread-views-count-every-load.md)).

# Steps

- [ ] The board: every sticky thread, then a page of 10 other threads, each list by its newest post, with the opener,
  the last post's habbo and time, the replies and the views; pages counted from the other threads.
- [ ] A thread: its posts 10 a page, oldest first, with each habbo's name, figure, motto, worn badge, favourite group
  and message count, and the editor of each edited post; archived habbos flagged.
- [ ] Writing: a thread with its first post, a reply, an edit with its time and editor, a view, the thread's title,
  sticky and closed state, and the time of a habbo's last post.
- [ ] Deleting a post, and with its last post the thread; deleting a thread with its posts.
- [ ] The forum thread entity's docs and the queries.
- [ ] Store tests: 2 stickies and 30 other threads put every thread on a page, counts and last posts follow deletes,
  and archived habbos are flagged.

# Verification

```sh
cd packages/store && go tool sqlc diff && gofmt -l . && go vet ./... && go test -race ./... && make check-docs
```
