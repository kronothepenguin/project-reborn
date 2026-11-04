---
type: Task
title: Manage banners in housekeeping
description: Staff with housekeeping.banners add, list, edit and delete banners with Holo's banners page, its add form working and its messages right.
status: todo
phase: p4
depends_on: [p4-03]
packages: [packages/housekeeping, tests/e2e]
holo: [source/holo/housekeeping/banners.php]
timestamp: 2026-11-04T01:28:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
---

# Goal

Staff manage the banners that the CMS shows, as Holo's banners page meant to.

# Steps

- [ ] `GET` and `POST /housekeeping/banners`, `GET` and `POST /housekeeping/banners/{id}`, and the delete confirmation and `POST /housekeeping/banners/{id}/delete`, for `housekeeping.banners`.
- [ ] Holo's add form, list, edit view and delete view, with its texts; adding works, and each message follows what happened.
- [ ] Image and link addresses are http(s) addresses or paths of the site.
- [ ] A staff log row for each change, and Holo's `Manage Site Banners` link in the Content Management box.
- [ ] Tests and a browser suite `housekeeping-banners`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd tests/e2e && pnpm test housekeeping-banners
```

# Notes

- Runs on the feature branch `p4-housekeeping`.
