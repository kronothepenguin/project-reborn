---
type: Task
title: List and delete uploaded images in housekeeping
description: An Uploaded Images page lists every uploaded picture with the articles using it, and deletes only the pictures no article uses.
status: done
phase: p4
depends_on: [p4-15]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T16:38:16+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T15:56:14+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T16:38:16+00:00"}
---

# Goal

Staff see every uploaded picture and delete the ones nothing uses
([0079](/decisions/0079-uploaded-images-managed.md)).

# Steps

- [x] `GET /housekeeping/images` lists the uploaded pictures, newest first, each with its thumbnail, format, size,
  uploader, date and the articles using it, linked to their edit pages.
- [x] `POST /housekeeping/images/{id}/delete` deletes an unused picture and logs `images.delete`; a picture in use answers
  with the articles to change or delete first.
- [x] `Uploaded Images` joins the Content Management box after `Manage Existing News Items`; both routes take
  `housekeeping.news`.
- [x] Tests, the access suite's routes, and a browser suite `housekeeping-images`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd tests/e2e && pnpm test housekeeping-images housekeeping-access
```

Results (2026-11-04T16:38:16+00:00):

- On the branch `p4-images`: `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`, and
  `make check-docs` in `packages/store`, whose staff log entity lists `images.delete`.
- From a fresh build, `housekeeping-access`, `housekeeping-admin`, `housekeeping-settings`, `housekeeping-maintenance`,
  `housekeeping-users`, `housekeeping-store`, `housekeeping-news`, `housekeeping-banners`, `housekeeping-images`,
  `updates`, `together` and the CMS's `news` pass all 477 checks. `housekeeping-images`, 15 checks: the link after
  `Manage Existing News Items`, Holo's tab, an empty list, two uploads newest first with `PNG`, a size in KB,
  `Admin-1 (ID: 1)` and their articles or `None`, thumbnails loaded from the CMS, an article linking to its edit form,
  a picture in use refused with 422 and the article named, an unused one deleted with `Image deleted successfully.` and
  no longer served by the CMS, the other deleted once its article takes another picture, both log rows, and Access
  Denied for staff without the attribute. The screenshots `images` and `images-in-use` show the page.
- The Go tests refuse both routes without the attribute; list the uploads with their format, size, uploader, articles
  and preview; delete an unused picture with its log row; name one, two and three articles in the refusal, and delete
  the picture once they take another; and answer 404 for a picture that does not exist or an id that is no number.
- Breaking these on purpose fails a test, 14 checks in all, each from a passing run: the attribute on both routes; the
  refusal of a picture in use, its singular, its list of articles; a missing picture answering 200; the answer of a
  delete; the log row and its path; and the page's articles, uploader, size, preview and format.

# Notes

- Runs on the feature branch `p4-images`.
- The delete relies on the database: it tries the delete, and when the link of an article refuses it, lists that
  picture's articles in the same transaction for the answer.
- Every picture has a `Delete` button; one in use answers with the articles that keep it, as the user asked.
- The page has no pages of its own: it lists every upload, with thumbnails that load as they scroll into view.
- `Unable to delete image; this image does not exist!` answers a picture that does not exist, with 404, in the words
  of Holo's news_manage.
