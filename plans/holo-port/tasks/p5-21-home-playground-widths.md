---
type: Task
title: Give home playgrounds their widths
description: The playground of a home is 752 pixels beside the club banner and 922 without it, as Holo's, now that Tailwind generates the two widths written beside the template's markers.
status: done
phase: p5
depends_on: []
packages: [packages/cms, tests/e2e]
holo: [source/holo/templates/community/hsubheader.php]
timestamp: 2026-11-05T20:13:30+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:09:02+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:13:30+00:00"}
---

# Goal

Homes keep Holo's playground widths ([P3](/phases/p3-homes.md)): 752 pixels with the club banner beside them, 922 for
club owners, and 922 for groups ([p5-05](/tasks/p5-05-group-page.md)).

# Steps

- [x] The classes `w-[922px]` and `w-[752px]` stand apart from the `[[ if ]]` markers, so that Tailwind finds and
  generates them; glued to the markers they were never generated, and every playground took the page's 912 pixels.
- [x] The `homes` browser suite measures the playground of a home with the banner and of a club owner's home.

# Verification

```sh
cd tests/e2e && node run.mjs homes
```

Results (2026-11-05T20:13:30+00:00):

- `node run.mjs homes` passes all 33 checks: Frank's home, without the club, has the 752-pixel playground beside the
  club banner, and the home of a club owner the 922-pixel playground with no banner.
- With the classes glued to the markers again, both checks fail at 912 pixels, the width every playground had.

# Notes

- Found by [p5-05](/tasks/p5-05-group-page.md)'s check of the group playground.
- A first try of that check passed with the glued classes: the backup of the file, left beside it, gave Tailwind the
  classes. Backups of a mutated file now stay outside the source tree.
