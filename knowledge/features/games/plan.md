---
type: Plan
title: "Instant games: how"
description: The game runs hh_ig, and the store saves the Game Hall of Fame.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/server` | `hh_ig` (`packages/server/knowledge/r26/hh_ig.md`): the directory, creating and joining games, invitations, arenas and stages, player input, game chat |
| `packages/store` | The Game Hall of Fame, which is saved ([server 0011](/decisions/server/0011-saved-and-memory-only-data.md)) |
| `packages/cms` | The hall of fame on the site, if wanted |

# Decisions

The user's decisions are written here when the feature is planned.
