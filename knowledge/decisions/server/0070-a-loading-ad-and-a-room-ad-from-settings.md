---
type: Decision
title: Rooms show a loading ad and a room ad from housekeeping's settings
description: 258 shows a loading ad and 208 a room ad, each an image URL and a link held by settings that housekeeping edits; empty settings show none.
status: accepted
timestamp: 2026-11-10T16:41:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:41:02+00:00"}
tags: [server, rooms, settings]
---

# Decision

- While a room loads, `GETINTERST` gets 258 with an image URL and a link, two settings; in the room, `GETROOMAD` gets 208
  with an image URL and a link of its own, two more settings. Housekeeping's Game form edits the four.
- An empty image shows no ad.

# Context

Holo showed one loading ad from its settings (`rooms_loadadvertisement_img`, `rooms_loadadvertisement_uri`). Offered no
ads, one loading ad, or a loading ad and a room ad, the user chose "Loading and room ads": "The loading ad above, plus a
room ad of its own (two more settings)", the loading ad being "Two settings in housekeeping, the image URL and the link,
shown while any room loads, as Holo did".

# Consequences

- s4-01 declares the settings, and s4-03 answers both.
