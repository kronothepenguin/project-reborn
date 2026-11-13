---
type: Slice
title: Moderation
description: Staff moderate the hotel from the client and from housekeeping: chat commands, the word filter, calls for help, bans and alerts that reach the game at once, and staff tools for groups.
status: planned
projects: [server, virtual, store, housekeeping, cms]
depends_on: [platform]
from: ["plans/later.md", "plans/server/phases/s7-club-help-extras.md"]
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [moderation]
---

# Goal

Staff keep the hotel in order, from the client and from housekeeping.

# Scope

| Project | Part |
| --- | --- |
| `packages/server` | Holo's chat commands and their fuses (`plans/later.md`, "Holo's chat commands"); the word filter; the call for help and Hobba of `hh_shared` (`plans/server/reference/r26/hh_shared.md`); a ban or an alert from housekeeping reaching the player at once |
| `packages/housekeeping` | The word filter's page and the welcome message's, which the port deferred; staff tools for groups (`plans/later.md`); Holo's "An ingame notification has been sent" restored |
| `packages/store` | What calls for help and the filter save |

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

From `plans/server/phases/s7-club-help-extras.md`, as written there:

- "Which moderation tools the client offers and which stay in housekeeping."
- "Who receives the calls for help, and where a staff member who follows one is taken: the client checks no right before
  it shows a call (148), and after `FOLLOW_CRYFORHELP` it waits for the server to move it, as 286 does".

And from `plans/later.md`: which of Holo's chat commands the hotel keeps, and where the word filter's words live.
