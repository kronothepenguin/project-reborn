---
type: Task
title: Write news in housekeeping
description: Staff with housekeeping.news compose, list, edit and delete articles with Holo's forms, a top-story picker and a link to the article on the site.
status: todo
phase: p4
depends_on: [p4-03]
packages: [packages/housekeeping, tests/e2e]
holo: [source/holo/housekeeping/news_compose.php, source/holo/housekeeping/news_manage.php]
timestamp: 2026-11-04T01:28:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
---

# Goal

Staff write the news that the CMS shows, as Holo's news_compose and news_manage pages did.

# Steps

- [ ] `GET /housekeeping/news`, `GET /housekeeping/news/new`, `POST /housekeeping/news`, `GET` and `POST /housekeeping/news/{id}`, `POST /housekeeping/news/{id}/delete`, for `housekeeping.news`.
- [ ] Holo's fields, texts and 20 categories, with `<shortname> Club`; BBCode instead of HTML in the body's help.
- [ ] The top-story picker offers the five local images and takes an http(s) address.
- [ ] The author is the staff member's active habbo; editing keeps the date and the author.
- [ ] A link to the article on the site, and a staff log row for each change.
- [ ] Holo's links in the Content Management box: `Compose News Item` and `Manage Existing News Items`.
- [ ] Tests and a browser suite `housekeeping-news`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd tests/e2e && pnpm test housekeeping-news
```

# Notes

- Runs on the feature branch `p4-housekeeping`.
