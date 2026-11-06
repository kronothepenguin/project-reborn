---
type: Task
title: Store the forum
description: The store gains the forum's operations, from the board's pages with stickies on every page to threads, posts, edits, deletes, thread settings, views and each habbo's last post, with counts taken from the posts that exist.
status: done
phase: p5
depends_on: []
packages: [packages/store]
holo: [source/holocms/install.php]
timestamp: 2026-11-05T22:08:25+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T22:08:25+00:00"}
---

# Goal

The CMS reads and writes the board through tested queries ([0088](/decisions/0088-stickies-head-every-page.md),
[0089](/decisions/0089-archived-habbos-show-as-archived.md), [0091](/decisions/0091-forum-spam-check.md),
[0094](/decisions/0094-thread-views-count-every-load.md)).

# Steps

- [x] The board: every sticky thread, then a page of 10 other threads, each list by its newest post, with the opener,
  the last post's habbo and time, the replies and the views; pages counted from the other threads.
- [x] A thread: its posts 10 a page, oldest first, with each habbo's name, figure, motto, worn badge, favourite group
  and message count, and the editor of each edited post; archived habbos flagged.
- [x] Writing: a thread with its first post, a reply, an edit with its time and editor, a view, the thread's title,
  sticky and closed state, and the time of a habbo's last post.
- [x] Deleting a post, and with its last post the thread; deleting a thread with its posts.
- [x] The forum thread entity's docs and the queries.
- [x] Store tests: 2 stickies and 30 other threads put every thread on a page, counts and last posts follow deletes,
  and archived habbos are flagged.

# Verification

```sh
cd packages/store && go tool sqlc diff && gofmt -l . && go vet ./... && go test -race ./... && make check-docs
```

Results (2026-11-05T22:08:25+00:00):

- `go tool sqlc diff`, `gofmt`, `go vet`, `go test -race` and `make check-docs` pass in `packages/store`.
- The store tests put 2 stickies and 30 other threads on the board: both stickies on their own list, 30 counted for the
  pages, and three pages of 10 listing every other thread once, newest post first; a reply takes the oldest thread to
  the top. Deleting the last post moves the last post back and lowers the replies and the habbo's messages; a thread
  with posts is not deleted as empty, and one without is. A page of posts shows the habbo's figure, motto, worn badge
  (not the one it holds unworn), favourite group (not another it joined), messages and editor; posts page 10 at a time,
  oldest first; an edit, a view and the settings are kept; deleting a thread takes its posts. An archived opener,
  author and editor carry their archive time, and the others do not.
- Breaking the queries on purpose fails a test: the board's order, the sticky filter, the replies, the page count, the
  newest post, the posts' order, the messages, the favourite and worn filters, the empty-thread check, the last post's
  time, the views and the archive times.

# Notes

- `forum_threads` and `forum_posts` were already in the schema from P0; this task adds their queries.
- `CAST(… AS DATETIME)` gives SQLite's numeric affinity, so a time parameter cast that way is stored as a number; the
  edit time stays a nullable parameter instead.
- Granting a badge wears it, so a habbo's second badge goes on only after the first comes off.

