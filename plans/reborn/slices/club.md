---
type: Slice
title: Club
description: Club is bought on the site and in the client, its gifts are given, and the game shows a player its club at once.
status: planned
projects: [store, server, cms]
depends_on: [platform, economy]
from: ["plans/server/phases/s7-club-help-extras.md", "plans/server/phases/s9-site-changes.md"]
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [club]
---

# Goal

Club is one feature wherever it is bought or ends ([0010](/decisions/0010-slices-follow-the-hotels-features.md)).

# Scope

| Project | Part |
| --- | --- |
| `packages/cms` | Sells club; tells the game |
| `packages/server` | Sends a player its club and its rights at once; sells club and its gifts in the client (`hh_club`, `plans/server/reference/r26/hh_club.md`) |
| `packages/store` | What club bought in the client needs |

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

- From `plans/server/phases/s7-club-help-extras.md`, as written there: "How club bought in the client meets club bought
  on the site (`plans/holo-port/phases/p6-economy.md`). The client's `SCR_BUY` sends which of its three buttons was
  pressed, 1 to 3, not a number of months".
- What of club's gifts is saved.
