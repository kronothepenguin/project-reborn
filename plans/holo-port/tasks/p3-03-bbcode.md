---
type: Task
title: Turn BBCode into HTML
description: packages/cms/internal/bbcode renders Holo's BBCode and smilies as safe HTML, with the plan's colour classes.
status: done
phase: p3
depends_on: [p3-01]
packages: [packages/cms]
holo: [source/holo/core.php]
timestamp: 2026-11-03T18:34:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T18:34:45+00:00"}
---

# Goal

Notes, and later news and the forum, render Holo's BBCode without letting HTML or scripts through.

# Steps

- [x] Holo's tags: b, i, u, s, quote, link, url, color, size small and large, code.
- [x] Text is escaped first, and links take only http and https.
- [x] Colours are classes, as the plan maps them.
- [x] Smilies when `features.smilies` is on.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-03T18:34:45+00:00):

- Built on the branch `p3-bbcode` and merged into `main` as `56fe9e97`; `black` joined the colours after the merge, from
  Holo's toolbar and the port's colours.
- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`, and the package's tests reach every line of it.
- The tests assert Holo's output for every tag, the one pass per tag in Holo's order, smilies on and off, and the attempts
  to inject HTML, scripts and addresses; 5,000 random texts always give nested HTML.
- Breaking these on purpose fails a test: the escaping of text and of addresses, the check of an address's scheme, finding
  smilies, and replacing them after escaping.

# Notes

- Crossed tags in Holo produced HTML that closed the page's own elements; `tree.go` nests them as a browser nested Holo's
  HTML, inside the text.
- A smiley image keeps `inline align-baseline`, because Tailwind's reset would put each one on its own line.
