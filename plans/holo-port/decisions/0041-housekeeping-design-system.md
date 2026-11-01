---
type: Decision
title: Housekeeping gets its own simple design system
description: Housekeeping follows Habbo's original housekeeping, simple tables with white and blue sections, in a new design system.
status: accepted
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [housekeeping, design]
---

# Decision

- Housekeeping uses a new design system: simple tables with white and blue sections, like Habbo's original housekeeping.
- The reference is the image the user chose:
  <https://static.wikia.nocookie.net/habbo/images/0/05/Habbo_housekeeping.png/revision/latest/scale-to-width-down/1000?cb=20100612224017&path-prefix=en>

# Context

The user answered: "new design system, habbo original housekeeping actually use tables with white and blue sections,
pretty simple, here is an image of what i like to build".

The answer came under the question about P3's art, but it describes housekeeping, so it is recorded here and the art
question stays open in [P3](/phases/p3-homes.md). The image is behind a bot check, so the agent could not open it.

# Consequences

- [HK-A](/phases/hk-a-housekeeping-core.md) needs the image saved in the repository before its layout starts.
- The [housekeeping colours](/reference/colours.md#housekeeping) come from Holo's panel and are checked against that image
  in HK-A.
