---
type: Task
title: Report posts
description: A signed-in habbo reports another habbo's post in Holo's Help Tool window, which sends a help ticket that housekeeping's help queue shows, with one waiting request per habbo.
status: todo
phase: p5
depends_on: [p5-13]
packages: [packages/cms, packages/store, packages/housekeeping, tests/e2e]
holo: [source/holo/iot/go.php, source/holo/iot/header.php, source/holo/iot/footer.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Habbos report posts to staff, as in Holo, through the window that [P7](/phases/p7-help.md) reuses
([0090](/decisions/0090-post-reports.md), [0095](/decisions/0095-group-search-and-report-addresses.md)).

# Steps

- [ ] The report flag shows to signed-in visitors on posts that are not the active habbo's, and opens
  `GET /forum/posts/{id}/report` in Holo's small window.
- [ ] The window's layout from Holo's `iot` pages, with its question and the `Proceed` button.
- [ ] `POST /forum/posts/{id}/report` answers `Thank you for reporting this post.`, Holo's waiting-request text or
  `Invalid post specified`, and writes the ticket with the post, Holo's subject and its message with the post's text
  and address.
- [ ] One waiting request or report per habbo, and the help ticket entity's docs follow.
- [ ] Housekeeping's help queue shows the report.
- [ ] Go tests, and the `forum` and `housekeeping-users` browser suites report a post and find it.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms, packages/store and packages/housekeeping
cd tests/e2e && node run.mjs forum housekeeping-users
```
