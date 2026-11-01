---
type: Task
title: Fix two texts found by the exit check
description: Keep the join button's text on one line, and keep the spaces around the log out button on the forgot page.
status: done
phase: p1
depends_on: [p1-13, p1-15]
packages: [packages/cms]
holo: []
timestamp: 2026-11-01T18:54:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:10:00+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:54:46+00:00"}
---

# Goal

Fix what the screenshots of [p1-18](/tasks/p1-18-exit-check-as-holo.md) showed and its assertions did not.

# Steps

- [x] `Join now, it's free >>` stays on one line inside the button.
- [x] `Please log out to use this feature.` keeps its spaces.
- [x] Look for the same whitespace pattern in the other pages.

# Verification

Then run the browser flow of [p1-18](/tasks/p1-18-exit-check-as-holo.md) with an exact check of both.

Results (2026-11-01T18:54:46+00:00):

- The browser flow passes with an exact check of `Please log out to use this feature.`, and of the join text's height on one
  line.
- A search of every `.astro` file found no other text beside an inline element across a line break.

# Notes

- Astro drops whitespace that holds a line break next to an element, so such a sentence belongs on one line.
- `>>` is wider than the `»` it replaced, and the text's box is half the button, so it needs `whitespace-nowrap`.
