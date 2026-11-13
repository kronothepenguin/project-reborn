---
type: Slice
title: Instant games
description: Habbos create, join, watch and play the instant games of hh_ig, from the lobby to the arena, with the Game Hall of Fame.
status: planned
projects: [server, virtual, store, cms]
depends_on: []
from: ["plans/server/phases/s8-instant-games.md"]
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [games]
---

# Goal

Habbos create, join, watch and play the instant games, and see the Game Hall of Fame. It was the server's phase S8.

# Scope

| Project | Part |
| --- | --- |
| `packages/server` | `hh_ig` (`plans/server/reference/r26/hh_ig.md`): the directory, creating and joining games, invitations, arenas and stages, player input, game chat |
| `packages/store` | The Game Hall of Fame, which is saved (`plans/server/decisions/0011-saved-and-memory-only-data.md`) |
| `packages/cms` | The hall of fame on the site, if wanted |

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

From `plans/server/phases/s8-instant-games.md`, as written there:

- "Which games the hotel runs, and where their rules come from, since the client holds only its own half."
- "What else of a game is saved besides the hall of fame."
- "Where the casts the client downloads to play a game come from: `hh_ig_gamesys`, and for SnowWar and BattleBall
  `hh_ig_game_<type>` with its `_ui` and `_room` casts. They are not in the repository, and they hold a running game's
  messages".
