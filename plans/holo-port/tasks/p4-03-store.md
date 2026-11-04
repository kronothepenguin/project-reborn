---
type: Task
title: Store news, banners and images
description: The store gains the news and banner operations and an images table with its update, the CMS serves uploaded images, and Holo's five top-story images join the CMS.
status: done
phase: p4
depends_on: []
packages: [packages/store, packages/cms]
holo: [source/holo/news.php, source/holo/includes/news_headlines.php, source/holo/housekeeping/banners.php]
timestamp: 2026-11-04T01:42:27+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:42:27+00:00"}
---

# Goal

The CMS and housekeeping have the data they need for news, banners and uploaded images ([0074](/decisions/0074-news-images.md)).

# Steps

- [x] News operations: create, update, delete, get, the archive, the 10 headlines, a category's last 25, and the 4 newest for the promo, newest first.
- [x] Banner operations: create, update, delete, get, every banner and the enabled ones, in the order they were added.
- [x] `images` (id, format, data, width, height, created_at, created_by_user_id) in a schema file and the update `0005-images.sql`, with its operations.
- [x] `GET /news/images/{id}` serves an uploaded image with its type and a long cache.
- [x] Holo's five top-story images in the CMS's public files, with the list housekeeping offers.
- [x] The store's knowledge documents every new file.

# Verification

```sh
# gofmt, go vet and go test -race in packages/store and packages/cms
cd packages/store && make check-docs && go tool sqlc diff
```

Results (2026-11-04T01:42:27+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store`, `packages/auth`, `packages/installer`,
  `packages/cms` and `packages/housekeeping`; `make check-docs` passes and `go tool sqlc diff` finds nothing.
- `pnpm test updates together` passes all 41 checks.
- The tests list the news newest first, by id on the same date, with the author's name or none, the 4 newest and a
  category's; editing keeps the author and the date; banners list in the order they were added, the enabled ones apart;
  images keep their bytes and refuse another format; the CMS serves an image only by its id and format, with a long
  cache.
- Breaking these on purpose fails a test: the news oldest first, the same date by id upwards, a category ignored, an edit
  that changes the date, disabled banners listed, an image served under another format, and a short cache.

# Notes

- `0005-images.sql` is the first update that a database cannot run twice. The update tests of UP made updates wait by
  deleting their rows from a current database, which only works for updates that can run again; they now build the
  database an older release left with `store.Connect` and the first updates, and the `updates` browser suite drops the
  `images` table of the hotel it makes old.
- The five top-story images live under `web-gallery/images/top-story/`, Holo's own path, and `seed.TopStories` lists
  them for the news form, defaulting to `top_story_news.png`.
