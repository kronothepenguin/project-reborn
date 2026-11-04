---
type: Task
title: Link articles to their uploaded images
description: Update 0006 links each article to its uploaded picture, so the database refuses to delete a picture in use, and the news form writes the link.
status: done
phase: p4
depends_on: [p4-05, p4-06]
packages: [packages/store, packages/housekeeping]
holo: []
timestamp: 2026-11-04T16:17:24+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T15:56:14+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T16:17:24+00:00"}
---

# Goal

Each article links to its uploaded picture, so that the database itself refuses to delete a picture in use
([0079](/decisions/0079-uploaded-images-managed.md)).

# Steps

- [x] Update 0006 adds `news_articles.image_id`, a link to `images` that refuses to delete a picture in use, and fills it
  for the articles whose top story is an uploaded picture's address; the schema file describes the same table.
- [x] The store's news operations write the link, and its image operations list the uploads with how many articles use
  each, list an image's articles, and delete an unused image; with their docs.
- [x] Housekeeping's news form writes the link with the address, and refuses a picture deleted in the meantime with the
  top-story message.
- [x] Tests: the update on a database with articles, the refused delete, and the form.

# Verification

```sh
# gofmt, go vet and go test -race in packages/store and packages/housekeeping
cd packages/store && make check-docs && go tool sqlc diff
cd tests/e2e && pnpm test updates housekeeping-news
```

Results (2026-11-04T16:17:24+00:00):

- On the branch `p4-images`: `gofmt`, `go vet` and `go test -race` pass in `packages/store`, `packages/housekeeping`
  and `packages/cms`, whose tests build older databases from the release's updates; `make check-docs` passes and
  `go tool sqlc diff` finds nothing.
- `pnpm test updates housekeeping-news housekeeping-admin` passes all 104 checks: a hotel from before updates now waits
  for 6 updates and opens once they are applied, and the article the news suite saves with an upload links to it.
- The store's tests run update 0006 on a database whose articles show two uploads, a wrong format, a missing upload, a
  leading zero, a local picture, an outside address with the same path, a query and another folder: only the first
  three link. The database refuses to delete an image an article shows, as `store.IsForeignKey`, and refuses to link a
  missing one; the uploads list newest first with their size, the first habbo of their uploader and how many articles
  show them; an image's articles list newest first.
- Housekeeping's tests: an article links its upload, loses the link for a local picture or an address, gets it back,
  and a save restores a missing link; a picture deleted between the check and the write, which triggers do, answers
  the top-story message with 422 on publish and on edit, and nothing is written or logged.
- Breaking these on purpose fails a test, 15 checks in all, each run first unbroken: the update's fill with any format,
  no fill, or a looser address; the link without its reference, in the update and in the schema file; the update query
  without the link; the count of articles; the uploader's habbo; the order of an image's articles; the form without the
  link on publish, on edit, or in the check; the change of the link alone; and each refusal of a deleted picture.

# Notes

- Runs on the feature branch `p4-images`.
- The link is `REFERENCES images(id)` with SQLite's default action, not `ON DELETE RESTRICT`. SQLite enforces RESTRICT
  through a trigger, so a refused delete reports `SQLITE_CONSTRAINT_TRIGGER` (1811), which `store.IsForeignKey` (787)
  does not know; the default action refuses the same delete at the end of the statement with the error it knows.
- `idx_news_articles_image_id` serves the list of an image's articles and the check of a delete.
- The `updates` browser suite drops `news_articles` with the other tables: SQLite cannot drop a column that refers to
  another table, and the table is empty, so the baseline makes it again without `image_id`. It now counts the release's
  updates, and housekeeping's update tests follow the release's list.
