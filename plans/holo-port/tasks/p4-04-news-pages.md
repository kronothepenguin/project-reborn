---
type: Task
title: Show the news
description: GET /news shows the archive and a category's listing, and GET /news/{id} an article, with the headlines column, as Holo's news.php.
status: done
phase: p4
depends_on: [p4-03]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/news.php]
timestamp: 2026-11-04T02:12:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T02:12:00+00:00"}
---

# Goal

Anyone reads the news, as in Holo's `news.php`.

# Steps

- [x] The headlines column: the 10 newest, `View our news archive`, and Holo's empty text.
- [x] The archive and a category's last 25, with Holo's texts; an unknown article shows the archive with status 404.
- [x] An article: title, `Posted` date and category link, the summary with its line breaks, the BBCode body without smilies, and the author's home.
- [x] The 210/560/160 columns of `body#news`, and the News sub-tab.
- [x] Tests and a browser suite `news`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && pnpm test news
```

Results (2026-11-04T02:12:00+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`.
- `pnpm test news` passes all 20 checks: the archive's title, heading, sub-tab and articles newest first with their
  dates; the headlines column; an article's title, date and category, its summary's line break, its BBCode body without
  smilies or HTML, its link, and the author's icon opening the author's home; a category's title, text and articles, one
  with an ampersand included; an unknown article showing the archive with status 404; and Holo's texts without news. The
  screenshots `news-archive`, `news-article` and `news-empty` were read by eye.
- The tests find every article in the archive and the 10 newest in the headlines, a category's 25 newest, an empty
  category listed as one, an article's escaped title, its summary with `<br />`, its body without smilies, an article
  without an author, five unknown ids showing the archive with status 404, the reader's session, and maintenance.
- Breaking these on purpose fails a test: 11 headlines or 30 in a category, an empty category taken for the archive, an
  unknown article answering 200, smilies in the news, the summary on one line, Holo's `d-m-Y` dates, no author, the wrong
  category, no headlines or reversed headlines, either page open during maintenance, and the line renderer unescaped or
  with smilies.

# Notes

- Holo dated its news `Y-m-d` (`$date_reversed` in `core.php`), so the dates match; the port shows the date in UTC.
- The summary goes through `bbcode.Lines`, Holo's `nl2br(htmlspecialchars())`.
- The author's icon links to `/home?name=`, as Holo's `user_profile.php?name=` did. No habbo is ever deleted, so only an
  article written without a habbo lacks an author, and it shows no author line.
- The columns are the components `news/headlines`, `news/archive` and `news/article`.
