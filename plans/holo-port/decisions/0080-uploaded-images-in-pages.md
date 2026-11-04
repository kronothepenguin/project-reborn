---
type: Decision
title: Uploaded Images shows ten pictures a page, turned in the browser
description: Housekeeping's Uploaded Images list shows ten pictures a page, turned in the browser with the Newer and Older links of the other lists; the address keeps the page through a delete, a reload and Back, and the news editor's gallery stays one grid.
status: accepted
timestamp: 2026-11-04T19:46:15+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T19:46:15+00:00"}
tags: [housekeeping, images]
---

# Decision

- The Uploaded Images page shows ten pictures a page. The server still sends every picture, and the browser shows one
  page at a time.
- `Newer` and `Older` links centred under the table turn the pages, as on the other housekeeping lists
  ([0060](/decisions/0060-housekeeping-components.md)).
- The address keeps the page (`/housekeeping/images?page=3`). A delete, a refused delete and a reload show the same
  page, and Back returns to the page before.
- The `Uploaded` gallery of the news editor gets no pages.

# Context

Told that the page of [0079](/decisions/0079-uploaded-images-managed.md) lists every upload on one page, the user asked:
"please add client-side pagination for uploaded images". The user then chose ten pictures a page over 20 or 100,
staying on the same page after a delete over going back to the first, and paging only this list over paging the
editor's gallery too.

# Consequences

- A delete carries the page it was made on, and its answer returns to that page.
