---
type: Task
title: Bring the art into the repository
description: Fetch the stickers, backgrounds, user badges and missing widget skins once, and commit them.
status: todo
phase: fx
depends_on: []
packages: [packages/cms]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

The home art ships inside the CMS binary, ready for [P3](/phases/p3-homes.md).

# Steps

- [ ] Fetch 419 stickers and 106 backgrounds, with what the archives hold, into `packages/cms/public/c_images/`.
- [ ] The 507 user badges and the 12 missing widget skins.
- [ ] List what stays missing.
- [ ] Check a built binary serves them with no network.

# Verification

```sh
pnpm --filter @project-reborn/cms build
# open a sticker, a background and a badge from the built binary
```

# Notes

- None yet.
