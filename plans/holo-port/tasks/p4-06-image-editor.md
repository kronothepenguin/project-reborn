---
type: Task
title: Cut, fit and preview news images
description: Housekeeping's news form uploads an image through an editor that cuts it to fill a 300x187 frame or fits it whole, previews it, and sends only the result, which the server checks, re-encodes and stores.
status: done
phase: p4
depends_on: [p4-05]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T02:30:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T02:30:46+00:00"}
---

# Goal

Staff give an article a top-story picture of their own ([0074](/decisions/0074-news-images.md)).

# Steps

- [x] An island in the news form: choose a picture, cut it by dragging and zooming it to fill the frame, or fit it whole with transparent bands, and preview it at 300x187.
- [x] A GIF that is already 300x187 is sent as it is, animation included; anything else is sent as the editor's PNG.
- [x] `POST /housekeeping/news/images` refuses what is not a 300x187 PNG or GIF or is too big, re-encodes it, stores it, and answers its address.
- [x] The article's picture becomes that address, and a staff log row records the upload.
- [x] Tests for the checks and the re-encoding, and browser checks of cutting, fitting and saving.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd tests/e2e && pnpm test housekeeping-news
```

Results (2026-11-04T02:30:46+00:00):

- On the branch `p4-housekeeping`: `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`, and
  `make check-docs` in `packages/store`, whose staff log entity lists `news.image`. `svelte-check` finds no error or
  warning in the island.
- `pnpm test housekeeping-news housekeeping-access` passes all 203 checks in a real browser. A picture of six stripes,
  drawn in the browser, opens in Cut filling the frame from its middle; dragging moves it and stops at its edge;
  zooming keeps the middle in place; Fit shows it whole with transparent bands; the PNG goes up, fills the field and
  the preview, is kept with its uploader, and the CMS serves the same pixels. The top story `accessories_top.gif`
  goes up byte for byte and stays a GIF, a JPEG goes up as the editor's PNG, a text file is explained, the saved
  article keeps the upload, and the log holds the three uploads. The screenshots `news-image-cut`, `news-image-fit`
  and `news-image-gif` show the editor.
- The Go tests send a PNG with a text chunk and a GIF of three frames with a comment and bytes after its end: both
  keep their pixels, and the GIF its frames, delays, disposal and loop, while the comment and the extra bytes are
  dropped. They refuse an empty body, text, a JPEG, every other size, cut files, a GIF without its end, 501 frames and
  a body past 2 MB, take 500 frames, and take an upload as a top story only at the path the CMS serves it at. The
  frame counter agrees with Go's decoder on both GIFs of the CMS and on GIFs with local colors and comments.
- Breaking these on purpose fails a test, 16 checks in Go: the attribute, the width, the height, the formats, storing
  the bytes as sent, a GIF kept as its first frame, the frame cap, the body limit, the frame counter twice, the log
  row, its uploader, and an uploaded path taken for any number, any format, a missing image or not at all. In the
  browser, 3 checks: a GIF of 300x187 sent through the editor, Cut letting the picture leave the frame, and zoom
  keeping the corner instead of the middle.

# Notes

- Runs on the feature branch `p4-housekeeping`.
- The body is the picture itself, with no form around it, and the answer is JSON: `{"path": ...}`, or
  `{"error": ...}` with 413 or 422.
- An upload takes at most 2 MB, and a GIF at most 500 frames, counted from its blocks before it is decoded, because
  a frame of a few hundred bytes decodes to 56 KB. [0074](/decisions/0074-news-images.md) gave no bounds.
- The preview and the editor draw on the olive of the CMS's news promo, so transparent bands look as they will there.
- An upload is kept even if the article is never saved; nothing deletes unused images.
