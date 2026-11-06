---
type: Task
title: Write news in housekeeping
description: Staff with housekeeping.news compose, list, edit and delete articles with Holo's forms, a top-story picker and a link to the article on the site.
status: done
phase: p4
depends_on: [p4-03]
packages: [packages/housekeeping, tests/e2e]
holo: [source/holocms/housekeeping/news_compose.php, source/holocms/housekeeping/news_manage.php]
timestamp: 2026-11-04T02:13:27+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T02:13:27+00:00"}
---

# Goal

Staff write the news that the CMS shows, as Holo's news_compose and news_manage pages did.

# Steps

- [x] `GET /housekeeping/news`, `GET /housekeeping/news/new`, `POST /housekeeping/news`, `GET` and `POST /housekeeping/news/{id}`, `POST /housekeeping/news/{id}/delete`, for `housekeeping.news`.
- [x] Holo's fields, texts and 20 categories, with `<shortname> Club`; BBCode instead of HTML in the body's help.
- [x] The top-story picker offers the five local images and takes an http(s) address.
- [x] The author is the staff member's active habbo; editing keeps the date and the author.
- [x] A link to the article on the site, and a staff log row for each change.
- [x] Holo's links in the Content Management box: `Compose News Item` and `Manage Existing News Items`.
- [x] Tests and a browser suite `housekeeping-news`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd tests/e2e && pnpm test housekeeping-news
```

Results (2026-11-04T02:13:27+00:00):

- On the branch `p4-housekeeping`: `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`, and in
  `packages/store`, whose staff log entity lists the new actions; `make check-docs` passes there.
- `pnpm test housekeeping-news housekeeping-access` passes all 186 checks in a real browser: Holo's texts and 20
  categories with `Reborn Club`, the five local pictures, a preview loaded from the CMS that follows the field, an
  article published, listed, refused with a bad picture, edited with its author and date kept, `Other` still selected
  after saving, deleted, its 404 answer, the three log rows, and Access Denied for staff without the attribute. The
  screenshots `news-compose`, `news-list` and `news-edit` show the pages.
- Breaking these on purpose fails a test, 21 checks in all: the attribute on each of the six routes, the check of the
  picture (every address, any scheme, any path of the site), the three log rows, the author taken from the active
  habbo, an edit that changes the date or the author in the store's query, a category not offered lost on edit,
  `Other` never selected, the club keeping Holo's name, the preview without `site.url`, and a missing article answering
  200 or without Holo's message.

# Notes

- Runs on the feature branch `p4-housekeeping`.
- An article that does not exist answers Holo's list with its message and 404, an id that is not a number too.
- The category is kept as Holo kept it: any value is saved, and the edit form keeps one that is no longer offered as a
  choice of its own, so saving never moves an article.
- A save that changes nothing writes nothing and logs nothing, as the home store does; the answer is still Holo's.
- Holo's edit and delete icons became the text `Edit` and a `Delete` button, the look of the other housekeeping lists.
