---
type: Task
title: Link articles to their uploaded images
description: Update 0006 links each article to its uploaded picture, so the database refuses to delete a picture in use, and the news form writes the link.
status: todo
phase: p4
depends_on: [p4-05, p4-06]
packages: [packages/store, packages/housekeeping]
holo: []
timestamp: 2026-11-04T15:56:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T15:56:14+00:00"}
---

# Goal

Each article links to its uploaded picture, so that the database itself refuses to delete a picture in use
([0079](/decisions/0079-uploaded-images-managed.md)).

# Steps

- [ ] Update 0006 adds `news_articles.image_id`, a link to `images` that refuses to delete a picture in use, and fills it
  for the articles whose top story is an uploaded picture's address; the schema file describes the same table.
- [ ] The store's news operations write the link, and its image operations list the uploads with how many articles use
  each, list an image's articles, and delete an unused image; with their docs.
- [ ] Housekeeping's news form writes the link with the address, and refuses a picture deleted in the meantime with the
  top-story message.
- [ ] Tests: the update on a database with articles, the refused delete, and the form.

# Verification

```sh
# gofmt, go vet and go test -race in packages/store and packages/housekeeping
cd packages/store && make check-docs && go tool sqlc diff
cd tests/e2e && pnpm test updates housekeeping-news
```

# Notes

- None yet.
