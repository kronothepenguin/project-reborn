---
type: Slice
title: Economy
description: Housekeeping changes credits, tickets and film, the site shows them and spends them in vouchers and purchases, and the game server shows a player its new balance at once.
status: planned
projects: [store, server, cms, housekeeping]
depends_on: [platform, habbos]
from: ["plans/server/phases/s9-site-changes.md"]
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [economy, credits]
---

# Goal

Credits, tickets and film are one feature wherever they change
([0010](/decisions/0010-slices-follow-the-hotels-features.md)).

The user: "credits: housekeeping allow modify credits, cms show credits and allow to spend them and server manages." And:
"what if we make an "economy" slice better, and include everything about economy there?"

# Scope

| Project | Part |
| --- | --- |
| `packages/services` | The `Economy` service: `SendCredits(ctx, userID)`, and tickets and film ([0005](/decisions/0005-the-game-hears-live-changes-through-services.md)) |
| `packages/housekeeping` | Gives and takes credits, tickets and film; tells the game |
| `packages/cms` | Vouchers, groups and the home store spend or give credits; tells the game |
| `packages/server` | Sends a player its new balance at once |

Today a change of credits on the site shows in the game at the player's next purchase or login. Club is
[its own slice](/slices/club.md).

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

- The names and the calls of the `Economy` service beyond `SendCredits`, for tickets and film.
