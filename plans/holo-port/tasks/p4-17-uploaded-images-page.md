---
type: Task
title: List and delete uploaded images in housekeeping
description: An Uploaded Images page lists every uploaded picture with the articles using it, and deletes only the pictures no article uses.
status: todo
phase: p4
depends_on: [p4-15]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T15:56:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T15:56:14+00:00"}
---

# Goal

Staff see every uploaded picture and delete the ones nothing uses
([0079](/decisions/0079-uploaded-images-managed.md)).

# Steps

- [ ] `GET /housekeeping/images` lists the uploaded pictures, newest first, each with its thumbnail, format, size,
  uploader, date and the articles using it, linked to their edit pages.
- [ ] `POST /housekeeping/images/{id}/delete` deletes an unused picture and logs `images.delete`; a picture in use answers
  with the articles to change or delete first.
- [ ] `Uploaded Images` joins the Content Management box after `Manage Existing News Items`; both routes take
  `housekeeping.news`.
- [ ] Tests, the access suite's routes, and a browser suite `housekeeping-images`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd tests/e2e && pnpm test housekeeping-images housekeeping-access
```

# Notes

- None yet.
