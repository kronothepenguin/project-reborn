---
type: Task
title: Show the board and its threads
description: GET /forum and GET /forum/threads/{id} show Holo's Discussion Board and its threads ten to a page, with stickies on every page, page links, the jump to the last post, a view counted on every load, and Holo's post boxes, while features.forum is on.
status: done
phase: p5
depends_on: [p5-01, p5-03, p5-12]
packages: [packages/cms, packages/components, tests/e2e]
holo: [source/holo/forum.php, source/holo/viewthread.php]
timestamp: 2026-11-05T22:22:51+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T22:22:51+00:00"}
---

# Goal

Anyone reads the board, as on Holo's `forum.php` and `viewthread.php` ([0017](/decisions/0017-guest-read-access.md),
[0087](/decisions/0087-online-picture-stays-offline.md), [0088](/decisions/0088-stickies-head-every-page.md),
[0089](/decisions/0089-archived-habbos-show-as-archived.md), [0094](/decisions/0094-thread-views-count-every-load.md)).

# Steps

- [x] `GET /forum`: Holo's board with its columns, `View page:` links, the `New Thread` buttons for signed-in
  visitors and Holo's line for guests.
- [x] `GET /forum/threads/{id}`: the posts 10 a page with `RE:` titles, dates and `Last modified ... by ...`, the
  jump to the last post, and a view counted on every load.
- [x] Post boxes: the name, the offline picture, `Messages:`, the avatar, the favourite group's badge, the worn badge
  and the motto; an archived habbo shows `archived` with no link and an empty box.
- [x] With `features.forum` off the pages send visitors to the landing page, as Holo did.
- [x] A `Pagination` primitive in `packages/components` for the page links, with a story, a test and its export.
- [x] Go tests, and a browser suite `forum`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
pnpm --filter @project-reborn/components test
cd tests/e2e && node run.mjs forum
```

Results (2026-11-05T22:22:51+00:00):

- `gofmt`, `go vet` and `go test -race` pass in the whole of `packages/cms`; `pnpm build` passes; `pnpm --filter
  @project-reborn/components test` passes 167 tests and `check` finds nothing.
- The CMS tests list both stickies on each page of 2 stickies and 13 other threads, the others ten a page by their
  newest post, with the page links and the first page for a page out of range or not a number; check a row's columns,
  pages, last page and stripes; find an empty board saying so, and a board of stickies alone not; send visitors to the
  landing page with `features.forum` off, without counting a view; count a view on each of two loads, and send a
  missing thread to the board; page a thread ten posts at a time with `RE:` on all but its first; and show a post box's
  name, motto, messages, worn badge, favourite group, edit, BBCode and stripe, and an archived author, editor and
  opener.
- `node run.mjs forum` passes all 19 checks: Holo's title, sub-tab, box and columns; both stickies on each page, with
  the sticky and closed marks; a row's pages, archived opener, last post, replies and views; the guest's line and no New
  Thread; the last post's date jumping to the last page; a thread's ten posts with `RE:`; Frank's post box and the
  archived one; `Last modified ... by Frank`; a view per load; the closed mark for signed-in habbos only, on a closed
  thread only; the New Thread buttons; and the board switched off. The screenshots `forum-board` and `forum-thread` were
  read by eye.
- Breaking these on purpose fails a test: the page's range, the stripes of threads and posts, the empty board, the last
  page, the feature switch on both pages, `RE:`, the view count and the missing thread's way back; in the browser, the
  archived opener, the archived box, the guest's New Thread, both closed marks, the edit line and the jump.

# Notes

- The thread page's `Post reply`, `Quote`, `Modify`, the delete and report buttons and the moderation tools come with
  [p5-14](/tasks/p5-14-post-threads-and-replies.md) to [p5-17](/tasks/p5-17-report-posts.md); the New Thread buttons
  open their form in p5-14.
- `Pagination` pairs with `PaginationItem`, one per page, since a page served with `[[ ]]` data writes its numbers in a
  `[[ range ]]` with one static item for the current page and one for the others.
- Astro's HTML compression drops a line break between two tags, so the board writes the space between a date and its
  time, and after `by:`, as `{" "}`.

