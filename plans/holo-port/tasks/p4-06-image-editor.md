---
type: Task
title: Cut, fit and preview news images
description: Housekeeping's news form uploads an image through an editor that cuts it to fill a 300x187 frame or fits it whole, previews it, and sends only the result, which the server checks, re-encodes and stores.
status: todo
phase: p4
depends_on: [p4-05]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T01:28:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
---

# Goal

Staff give an article a top-story picture of their own ([0074](/decisions/0074-news-images.md)).

# Steps

- [ ] An island in the news form: choose a picture, cut it by dragging and zooming it to fill the frame, or fit it whole with transparent bands, and preview it at 300x187.
- [ ] A GIF that is already 300x187 is sent as it is, animation included; anything else is sent as the editor's PNG.
- [ ] `POST /housekeeping/news/images` refuses what is not a 300x187 PNG or GIF or is too big, re-encodes it, stores it, and answers its address.
- [ ] The article's picture becomes that address, and a staff log row records the upload.
- [ ] Tests for the checks and the re-encoding, and browser checks of cutting, fitting and saving.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd tests/e2e && pnpm test housekeeping-news
```

# Notes

- Runs on the feature branch `p4-housekeeping`.
