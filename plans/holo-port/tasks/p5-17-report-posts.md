---
type: Task
title: Report posts
description: A signed-in habbo reports another habbo's post in Holo's Help Tool window, which sends a help ticket that housekeeping's help queue shows, with one waiting request per habbo.
status: done
phase: p5
depends_on: [p5-13]
packages: [packages/cms, packages/store, packages/housekeeping, tests/e2e]
holo: [source/holocms/iot/go.php, source/holocms/iot/header.php, source/holocms/iot/footer.php]
timestamp: 2026-11-06T17:54:34+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T17:54:34+00:00"}
---

# Goal

Habbos report posts to staff, as in Holo, through the window that [P7](/phases/p7-help.md) reuses
([0090](/decisions/0090-post-reports.md), [0095](/decisions/0095-group-search-and-report-addresses.md)).

# Steps

- [x] The report flag shows to signed-in visitors on posts that are not the active habbo's, and opens
  `GET /forum/posts/{id}/report` in Holo's small window.
- [x] The window's layout from Holo's `iot` pages, with its question and the `Proceed` button.
- [x] `POST /forum/posts/{id}/report` answers `Thank you for reporting this post.`, Holo's waiting-request text or
  `Invalid post specified`, and writes the ticket with the post, Holo's subject and its message with the post's text
  and address.
- [x] One waiting request or report per habbo, and the help ticket entity's docs follow.
- [x] Housekeeping's help queue shows the report.
- [x] Go tests, and the `forum` and `housekeeping-users` browser suites report a post and find it.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms, packages/store and packages/housekeeping
cd tests/e2e && node run.mjs forum housekeeping-users
```

Results (2026-11-06T17:54:34+00:00):

- `gofmt` lists nothing, and `go vet` and `go test -race` pass in `packages/cms`, `packages/store` and
  `packages/housekeeping`. In `packages/store`, `go tool sqlc generate` leaves the generated code as committed and
  `make check-docs` passes; `pnpm build` passes, and `svelte-check` finds nothing in the new islands.
- The store test counts a habbo's waiting help requests and reports alike, never another habbo's, and stops counting
  each once staff pick it up. The CMS tests show the flag on every post but the active habbo's, to Frank's other
  habbo too and to no guest, with the page shown; the window asking, with the page a whole number from 1, and writing
  nothing, while the board is off too; Holo's ticket with the subject, the message, the post, the habbo and the
  address; the waiting text before a missing post, per habbo and not per address, after a help request too, and
  gone once staff pick up; and 404 for a missing post, guests sent to `/` and a cross-site post refused, with no
  ticket written. Breaking each of ten parts of the work on purpose fails a test.
- `pnpm test forum housekeeping-users`, which runs `node run.mjs` on both, passes all 105 checks: 59 in `forum`, 46 in
  `housekeeping-users`. Frank finds the flag on Dora's five posts and none on his own, and a guest none; a flag opens
  the window named `habbohelp` as a popup, another flag takes it over, Proceed sends the report and Close shuts the
  window, and the next report gets Holo's refusal; a moderator finds the flag under the delete button. In
  housekeeping, Frank's waiting help request refuses his report, and once staff pick it up his report reaches the
  queue with the post's text and its address. The screenshots `forum-report-window`, `forum-report-thanks`,
  `forum-report-waiting`, `forum-report-flag-moderator` and `help-report` were read by eye against Holo's window drawn
  from its own files; a page drawn with Holo's styles and with the port's puts the delete button and the flag in the
  same boxes.

# Notes

- The flag stands in Holo's `post-list-report-element` beside the delete button, with Holo's margins:
  `forum/report-post` opens it as Holo's `openOrFocusHelp` did, in a window named `habbohelp`, 980 by 597 pixels
  (740 wide on a screen under 990).
- The delete button takes the margins of Holo's `myhabbo.css` and `discussions.css` that
  [p5-15](/tasks/p5-15-edit-delete-posts.md) left out, 4 pixels to its left and 10 below, so that the flag stacks
  under it as in Holo; for its author the icon moves 4 pixels right, where Holo drew it.
- The window is the body layout `layouts/help-tool.astro`: `iot/header.php`, `iot/footer.php` and the portlet of
  `iot/go.php`, with Holo's art in `public/iot/`. Its logo is `/habbo.png`, the same picture as Holo's
  `habbo_logo_uk.gif`. `help/help-window` does what the window's scripts did: it scrolls to the foot once loaded,
  and `Close` closes it. [P7](/phases/p7-help.md)'s help page reuses the layout
  ([0090](/decisions/0090-post-reports.md)).
- The page keeps `go.php`'s report: the Help Tool's heading and text, the answer in bold, and `Close` at the bottom
  right. `Proceed` is a button where Holo's link stood, with the link's look, as Sign Out and the alerts' remove
  button keep theirs.
- Holo's iot styles define none of the button classes the page names, so `Close` is the browser's own button; the
  page undoes Tailwind's reset on it.
- Housekeeping needed no change: its queue and its ticket page show a report's subject, text and address as they
  show a help request's.
- The ticket's message is Holo's, with `a post` for `an post`, and the thread's address under `site.url`, as Holo's
  under its `$path`.
- `GET /forum/posts/{id}/report` answers 200, or 404 for `Invalid post specified`; `POST` answers 200, 422 for the
  waiting request and 404 for a missing post. The checks run in `go.php`'s order, the waiting request first, and the
  post read and the ticket written in one transaction.
