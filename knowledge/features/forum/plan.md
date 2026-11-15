---
type: Plan
title: "Forum: how"
description: The CMS serves the board, its forms and its Moderation Tools, the store keeps threads and posts, and a report becomes a help ticket.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/cms` | `/forum` routes, the new thread, reply, delete and moderation islands, `POST /bbcode/preview`, and the report window on the `layouts/help-tool` layout |
| `packages/store` | Threads, posts, and the help ticket of a report |
| `packages/components` | The BBCode editor of the posts |
| `packages/housekeeping` | Shows a report in the help queue as it shows a help request |

# Decisions

- [Group roles and forum posts belong to the active
  habbo](/decisions/holo-port/0086-roles-and-posts-follow-the-active-habbo.md) — Only the active habbo's posts count as
  the user's own.
- [The online picture stays offline until the game
  server](/decisions/holo-port/0087-online-picture-stays-offline.md) — Forum posts show every habbo offline.
- [Sticky threads head every page of the forum](/decisions/holo-port/0088-stickies-head-every-page.md) — Then ten other
  threads, with pages counted from the other threads.
- [Habbos are archived, and the forum shows them as
  archived](/decisions/holo-port/0089-archived-habbos-show-as-archived.md) — An archived habbo's posts show `archived`.
- [One waiting request per habbo, and reports in the Help Tool's window](/decisions/holo-port/0090-post-reports.md) —
  Proceed in Holo's Help Tool window sends the report.
- [The forum refuses blank posts and posts within 30
  seconds](/decisions/holo-port/0091-forum-spam-check.md) — Holo's unused `Spam detected!` answers a post too soon.
- [A WYSIWYG BBCode editor of our own wherever BBCode is
  written](/decisions/holo-port/0092-bbcode-editor.md) — Posts are written in the shared BBCode editor.
- [A thread counts a view on every load](/decisions/holo-port/0094-thread-views-count-every-load.md) — Reloads
  included, as in Holo.
- [The group search and the report window get their own
  addresses](/decisions/holo-port/0095-group-search-and-report-addresses.md) — `GET /forum/posts/{id}/report` shows the
  Help Tool window.

# Notes

- Astro's HTML compression drops a line break between two tags, so the board writes the space between a date and its
  time, and after `by:`, as `{" "}`.
- `Pagination` pairs with `PaginationItem`, one per page: a page served with `[[ ]]` data writes its numbers in a
  `[[ range ]]` with one static item for the current page and one for the others.
- `CAST(… AS DATETIME)` gives SQLite's numeric affinity, so a time parameter cast that way is stored as a number; the
  edit time stays a nullable parameter instead.
- The posts and the forms sit in tables of their own, since an island cannot sit inside a table's rows.
- The Moderation Tools load the thread from `GET /forum/threads/{id}/settings` when they open, as Holo's
  `opentopicsettings.php` did, so they show what another moderator changed since the page loaded.
- The report window is named `habbohelp`, 980 by 597 pixels, 740 wide on a screen under 990, as Holo's
  `openOrFocusHelp`.
- A report checks the waiting request first, as Holo's `go.php`, and reads the post and writes the ticket in one
  transaction. `GET` answers 200 or 404; `POST` answers 200, 422 for the waiting request and 404 for a missing post.
