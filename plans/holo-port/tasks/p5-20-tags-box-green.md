---
type: Task
title: Colour the Me page's Tags box as Holo's
description: The Me page's Tags box takes the green heading and tab line of Holo's green box, in place of the orange of its default boxes.
status: done
phase: p5
depends_on: []
packages: [packages/cms, tests/e2e]
holo: [source/holocms/me.php, source/holocms/web-gallery/v2/styles/style.css]
timestamp: 2026-11-05T19:58:35+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:56:57+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:58:35+00:00"}
---

# Goal

The Tags box looks as Holo's did, beside the Groups box of [p5-04](/tasks/p5-04-buy-groups.md).

# Steps

- [x] Holo's `me.php` draws the Tags box as `cbb green`: the heading and the line under the tabs take #3ba800
  (lime-600), where the port has the default box's orange-500 and amber-500.
- [x] The `me` browser suite checks the colours.

# Verification

```sh
cd tests/e2e && node run.mjs me
```

Results (2026-11-05T19:58:35+00:00):

- `node run.mjs me` passes all 37 checks. The new one compares the heading's colour and the tab line's with
  Tailwind's lime-600 in the page.
- Putting back the orange heading or the amber line fails it.

# Notes

- Found while building the Groups box, whose blue box shares the Tags box's layout.
