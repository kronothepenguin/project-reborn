---
type: Task
title: Store news, banners and images
description: The store gains the news and banner operations and an images table with its update, the CMS serves uploaded images, and Holo's five top-story images join the CMS.
status: todo
phase: p4
depends_on: []
packages: [packages/store, packages/cms]
holo: [source/holo/news.php, source/holo/includes/news_headlines.php, source/holo/housekeeping/banners.php]
timestamp: 2026-11-04T01:28:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
---

# Goal

The CMS and housekeeping have the data they need for news, banners and uploaded images ([0074](/decisions/0074-news-images.md)).

# Steps

- [ ] News operations: create, update, delete, get, the archive, the 10 headlines, a category's last 25, and the 4 newest for the promo, newest first.
- [ ] Banner operations: create, update, delete, get, every banner and the enabled ones, in the order they were added.
- [ ] `images` (id, format, data, width, height, created_at, created_by_user_id) in a schema file and the update `0005-images.sql`, with its operations.
- [ ] `GET /news/images/{id}` serves an uploaded image with its type and a long cache.
- [ ] Holo's five top-story images in the CMS's public files, with the list housekeeping offers.
- [ ] The store's knowledge documents every new file.

# Verification

```sh
# gofmt, go vet and go test -race in packages/store and packages/cms
cd packages/store && make check-docs && go tool sqlc diff
```

# Notes

- None yet.
