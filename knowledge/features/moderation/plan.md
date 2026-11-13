---
type: Plan
title: "Moderation: how"
description: The game runs chat commands, the word filter and calls for help; housekeeping holds the staff pages.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/server` | Holo's chat commands and their fuses ([later](/features/moderation/later.md), "Holo's chat commands"); the word filter; the call for help and Hobba of `hh_shared` (`packages/server/knowledge/r26/hh_shared.md`); a ban or an alert from housekeeping reaching the player at once |
| `packages/housekeeping` | The word filter's page and the welcome message's, which the port deferred; staff tools for groups ([later](/features/moderation/later.md)); Holo's "An ingame notification has been sent" restored |
| `packages/store` | What calls for help and the filter save |

# Decisions

The user's decisions are written here when the feature is planned.
