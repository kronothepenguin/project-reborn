---
type: Task
title: Show the news
description: GET /news shows the archive and a category's listing, and GET /news/{id} an article, with the headlines column, as Holo's news.php.
status: todo
phase: p4
depends_on: [p4-03]
packages: [packages/cms, tests/e2e]
holo: [source/holo/news.php]
timestamp: 2026-11-04T01:28:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
---

# Goal

Anyone reads the news, as in Holo's `news.php`.

# Steps

- [ ] The headlines column: the 10 newest, `View our news archive`, and Holo's empty text.
- [ ] The archive and a category's last 25, with Holo's texts; an unknown article shows the archive with status 404.
- [ ] An article: title, `Posted` date and category link, the summary with its line breaks, the BBCode body without smilies, and the author's home.
- [ ] The 210/560/160 columns of `body#news`, and the News sub-tab.
- [ ] Tests and a browser suite `news`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && pnpm test news
```

# Notes

- None yet.
