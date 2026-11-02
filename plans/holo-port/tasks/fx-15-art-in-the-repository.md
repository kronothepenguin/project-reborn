---
type: Task
title: Bring the art into the repository
description: Fetch the stickers, backgrounds, user badges and missing widget skins once, and commit them.
status: done
phase: fx
depends_on: []
packages: [packages/cms]
holo: []
timestamp: 2026-11-02T02:58:24+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T02:58:24+00:00"}
---

# Goal

The home art ships inside the CMS binary, ready for [P3](/phases/p3-homes.md).

# Steps

- [x] Fetch 419 stickers and 106 backgrounds, with what the archives hold, into `packages/cms/public/c_images/`.
- [x] The 507 user badges and the 12 missing widget skins.
- [x] List what stays missing.
- [x] Check a built binary serves them with no network.

# Verification

```sh
pnpm --filter @project-reborn/cms build
# open a sticker, a background and a badge from the built binary
```

Results (2026-11-02T02:58:24+00:00):

- 1064 images, 7 MB, each checked to be a GIF, PNG or JPEG, are in `packages/cms/public/c_images/`.
- `make e2e` passed all 395 checks. The new `art` suite fetched a sticker, two backgrounds, a badge and two skins from the built
  binary, which served each as an image.
- The CMS binary grew by 8 MB, to 28 MB with debug data.

# Notes

- The archive's 507 entries were 494 badges and 13 other files, such as `Thumbs.db`, which stayed out. The step above and
  [0061](/decisions/0061-art-in-the-repository.md) say 507.
- [The home art](/reference/art.md) lists what came from where, and what is still missing.
