---
type: Task
title: Turn BBCode into HTML
description: packages/cms/internal/bbcode renders Holo's BBCode and smilies as safe HTML, with the plan's colour classes.
status: todo
phase: p3
depends_on: [p3-01]
packages: [packages/cms]
holo: [source/holo/core.php]
timestamp: 2026-11-03T17:26:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
---

# Goal

Notes, and later news and the forum, render Holo's BBCode without letting HTML or scripts through.

# Steps

- [ ] Holo's tags: b, i, u, s, quote, link, url, color, size small and large, code.
- [ ] Text is escaped first, and links take only http and https.
- [ ] Colours are classes, as the plan maps them.
- [ ] Smilies when `features.smilies` is on.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
