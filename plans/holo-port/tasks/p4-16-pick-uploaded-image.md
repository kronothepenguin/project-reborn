---
type: Task
title: Pick an uploaded picture in the news editor
description: The news form's image editor gains an Uploaded mode with a thumbnail of every uploaded picture, and clicking one fills the top-story field and the preview.
status: done
phase: p4
depends_on: [p4-15]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T16:29:13+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T15:56:14+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T16:29:13+00:00"}
---

# Goal

Staff reuse a picture already uploaded instead of uploading it again
([0079](/decisions/0079-uploaded-images-managed.md)).

# Steps

- [x] A list of the uploaded pictures, newest first, for `housekeeping.news`.
- [x] The image editor's third mode, `Uploaded`, shows their thumbnails; clicking one fills the top-story field and the
  preview, as an upload does.
- [x] Tests, and browser checks in `housekeeping-news`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd tests/e2e && pnpm test housekeeping-news
```

Results (2026-11-04T16:29:13+00:00):

- On the branch `p4-images`: `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`, and `svelte-check`
  finds no error or warning in the island.
- `pnpm test housekeeping-news housekeeping-access` passes all 226 checks from a fresh build: on a hotel without
  uploads `Uploaded` says `No pictures were uploaded yet.`; after three uploads in the page it shows them newest first
  without a reload, the field's own pressed and the old answer gone; the thumbnails load from the CMS; clicking the
  oldest fills the field and the preview and answers `Chosen as the topstory image. Save the article to keep it.`; the
  saved article shows and links that picture, and its edit form offers the three again with it pressed. The screenshot
  `news-image-uploaded` shows the mode.
- The Go test finds the uploads newest first in the compose form, the edit form and both refused forms.
- Breaking these on purpose fails a test, 6 checks in all, each from a passing run: the uploads left out of the page,
  given the wrong format, or listed oldest first; and in the browser, a thumbnail that does not fill the field, an
  upload that does not join the gallery, and no thumbnail pressed for the field's picture.

# Notes

- Runs on the feature branch `p4-images`.
- The list arrives as page data: the news form holds a hidden list of the uploads' paths with `site.url`, which the
  island reads, as other islands read their data from the page. An upload joins the list in the page at once.
- The thumbnails are 150x94, half the frame, load from `site.url` like the preview, and only when the mode opens.
- Switching modes clears the editor's last answer.
