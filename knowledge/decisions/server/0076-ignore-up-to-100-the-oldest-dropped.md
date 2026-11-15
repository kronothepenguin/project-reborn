---
type: Decision
title: A habbo ignores up to 100 habbos, the oldest dropped
description: A habbo's ignore list holds game.maxIgnoredHabbos habbos, 100; ignoring one more drops the oldest, which the client shows with the answer 2.
status: accepted
timestamp: 2026-11-10T18:05:15+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T18:05:15+00:00"}
tags: [server, rooms, chat]
---

# Decision

- A habbo's ignore list holds up to `game.maxIgnoredHabbos` habbos, 100 by default.
- Ignoring one more drops the oldest it ignores, and the answer is 419 with 2, which the client handles as added with
  the oldest dropped.

# Context

The client's ignore list answers are 0 failed, 1 added, 2 added with the oldest dropped, and 3 removed. Offered 100
with the oldest dropped, 100 then refused, or no limit, the user chose "100, oldest dropped (Recommended)": "Up to 100
(a setting). Ignoring a 101st drops the oldest one, an answer the client already handles. Example: someone with 100
ignored who ignores one more stops ignoring the first one they added."

# Consequences

- s4-05 applies it, with the setting `game.maxIgnoredHabbos`.
