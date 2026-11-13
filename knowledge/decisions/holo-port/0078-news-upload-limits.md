---
type: Decision
title: News image uploads stay within 2 MB and 500 frames
description: An uploaded news picture is at most 2 MB and an animated GIF at most 500 frames, and the texts the news editor and banners gained where Holo had none stay as written.
status: accepted
timestamp: 2026-11-04T15:56:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T15:56:14+00:00"}
tags: [news, housekeeping, images]
---

# Decision

- The server refuses an upload over 2 MB with `The image must be at most 2 MB.`, and a GIF of more than 500 frames with
  `The GIF must have at most 500 frames.`, counting the frames before it decodes them.
- The texts written where Holo had none stay as they are: the top-story and upload refusals, the image editor's labels
  and answers, `View on site`, and the two banner refusals.

# Context

[0074](/decisions/holo-port/0074-news-images.md) gave the uploads no bounds. The housekeeping agent chose 2 MB and 500 frames (a
300x187 frame takes 56 KB once decoded, so 500 frames take about 28 MB) and wrote the new texts. The user kept the limits
and the texts as written.

# Consequences

- p4-06 stands as built.
