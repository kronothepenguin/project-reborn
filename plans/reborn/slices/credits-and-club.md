---
type: Slice
title: Credits and club
description: Housekeeping changes credits, the site shows and spends them and sells club, and the game server shows a player its balance and its club at once and sells club in the client.
status: planned
projects: [store, virtual, server, cms, housekeeping]
depends_on: [platform]
from: ["plans/server/phases/s7-club-help-extras.md", "plans/server/phases/s9-site-changes.md"]
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [credits, club]
---

# Goal

Credits and club are one feature wherever they change.

The user: "credits: housekeeping allow modify credits, cms show credits and allow to spend them and server manages."

# Scope

| Project | Part |
| --- | --- |
| `packages/housekeeping` | Gives and takes credits, tickets and film; tells the game |
| `packages/cms` | Vouchers, club, groups and the home store spend or give credits; tells the game |
| `packages/server` | Sends a player its new balance and club at once; sells club and its gifts in the client (`hh_club`, `plans/server/reference/r26/hh_club.md`) |
| `packages/store` | What club bought in the client needs |

Today a change of credits on the site shows in the game at the player's next purchase or login.

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

- From `plans/server/phases/s7-club-help-extras.md`, as written there: "How club bought in the client meets club bought
  on the site (`plans/holo-port/phases/p6-economy.md`). The client's `SCR_BUY` sends which of its three buttons was
  pressed, 1 to 3, not a number of months".
- What of club's gifts is saved.
