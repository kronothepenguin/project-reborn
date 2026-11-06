---
type: Task
title: Manage banners in housekeeping
description: Staff with housekeeping.banners add, list, edit and delete banners with Holo's banners page, its add form working and its messages right.
status: done
phase: p4
depends_on: [p4-03]
packages: [packages/housekeeping, tests/e2e]
holo: [source/holocms/housekeeping/banners.php]
timestamp: 2026-11-04T02:40:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T02:40:37+00:00"}
---

# Goal

Staff manage the banners that the CMS shows, as Holo's banners page meant to.

# Steps

- [x] `GET` and `POST /housekeeping/banners`, `GET` and `POST /housekeeping/banners/{id}`, and the delete confirmation and `POST /housekeeping/banners/{id}/delete`, for `housekeeping.banners`.
- [x] Holo's add form, list, edit view and delete view, with its texts; adding works, and each message follows what happened.
- [x] Image and link addresses are http(s) addresses or paths of the site.
- [x] A staff log row for each change, and Holo's `Manage Site Banners` link in the Content Management box.
- [x] Tests and a browser suite `housekeeping-banners`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd tests/e2e && pnpm test housekeeping-banners
```

Results (2026-11-04T02:40:37+00:00):

- On the branch `p4-housekeeping`: `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`, and
  `make check-docs` in `packages/store`, whose staff log entity lists the three banner actions.
- `pnpm test housekeeping-banners` passes its 25 checks in a real browser: the `Manage Site Banners` link in Holo's
  order of the Content Management box, the page's title, Holo's texts and lengths, a new banner disabled, an empty
  post answering `You're something forgotten!`, a script for a link refused with what was typed kept, a banner added
  and listed as Holo listed it, the edit view with no answer before a post and `Succesfully edited!` after one, a blank
  url refused there, Holo's delete question, `Succesfully deleted!` in the list, `Something was going wrong!` with 404
  for a banner that is gone, the three log rows, a moderator reaching the banners and not the news, and Access Denied
  for staff without the attribute. The screenshots `banners`, `banners-added`, `banners-edit` and `banners-delete` show
  the views.
- With it, `housekeeping-access`, `housekeeping-settings`, `housekeeping-maintenance`, `housekeeping-users`,
  `housekeeping-store`, `housekeeping-news`, `updates` and `together` pass: 427 of 428 checks. The one failure is
  `housekeeping-admin`'s `the administrator finds every update applied`, which expects 4 applied updates while
  `0005-images.sql` of [p4-03](/tasks/p4-03-store.md), on `main`, makes 5, as the page shows; this branch does not
  touch the updates or that suite.
- Breaking these on purpose fails a test, 25 checks in all: the attribute on each of the six routes, Holo's add that
  asked for an id, each url being asked for, the status taken from anything but `1`, the trim of the link, the lengths
  of the text, at 49 and 100, and of the link, either url left unchecked, any address taken, a path starting with two
  slashes, one with a backslash, each answer in the wrong place or wrong (added, deleted, edited, a missing banner),
  a missing banner answering 200, and each of the three log rows.
- The tests first missed two of those breaks, the trim of the link and the check of two slashes, which `url.Parse`
  covered for `//host` but not for `///host`; a link of spaces and `///evil.example.com/` were added, and both breaks
  now fail.

# Notes

- Runs on the feature branch `p4-housekeeping`.
- The delete confirmation is `GET /housekeeping/banners/{id}/delete`, Holo's `Delete banner` view.
- Each answer is a row at the top of its box, as Holo printed them: the add form's, the edit view's, and the list's for
  a delete and for a banner that does not exist, which answers `Something was going wrong!` with 404.
- An edit stays on the edit view, as Holo's did; a delete goes back to the list, since the banner is gone.
- The text may be blank, as in Holo, which asked only for the two urls; only a status of `1` enables a banner.
- The urls are trimmed, and `///host` is refused with `//host`: a browser reads another host from both.
