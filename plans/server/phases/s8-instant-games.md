---
type: Phase
title: S8 Instant games
description: Habbos create, join and play the instant games of hh_ig, from the lobby to the arena, with the Game Hall of Fame.
status: moved
moved_to: plans/reborn/slices/games.md
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s8, server]
---

Moved on 2026-11-13: this work is the slice `plans/reborn/slices/games.md`.

# Goal

Habbos create, join, watch and play the instant games, from the lobby to the arena, and see the Game Hall of Fame.

# Scope

| Client | Reference | Parts |
| --- | --- | --- |
| `hh_ig` | [s1-21](/tasks/s1-21-instant-games.md) | The directory, creating and joining games, invitations, arenas and stages, player input, game chat, the hall of fame |

- Saved: the Game Hall of Fame ([0011](/decisions/0011-saved-and-memory-only-data.md)).

# Exit criteria

Written with the phase's tasks, once its open questions are answered.

# Tasks

Written when the phase starts.

# Open questions

- Which games the hotel runs, and where their rules come from, since the client holds only its own half.
- What else of a game is saved besides the hall of fame.
- Where the casts the client downloads to play a game come from: `hh_ig_gamesys`, and for SnowWar and BattleBall
  `hh_ig_game_<type>` with its `_ui` and `_room` casts. They are not in the repository, and they hold a running
  game's messages, the senders of `MSG_PLAYER_INPUT` and the reader of the rest of 403
  ([hh_ig](/reference/r26/hh_ig.md#in-game)).
