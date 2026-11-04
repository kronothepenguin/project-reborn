---
type: Task
title: Pick an uploaded picture in the news editor
description: The news form's image editor gains an Uploaded mode with a thumbnail of every uploaded picture, and clicking one fills the top-story field and the preview.
status: todo
phase: p4
depends_on: [p4-15]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T15:56:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T15:56:14+00:00"}
---

# Goal

Staff reuse a picture already uploaded instead of uploading it again
([0079](/decisions/0079-uploaded-images-managed.md)).

# Steps

- [ ] A list of the uploaded pictures, newest first, for `housekeeping.news`.
- [ ] The image editor's third mode, `Uploaded`, shows their thumbnails; clicking one fills the top-story field and the
  preview, as an upload does.
- [ ] Tests, and browser checks in `housekeeping-news`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd tests/e2e && pnpm test housekeeping-news
```

# Notes

- None yet.
