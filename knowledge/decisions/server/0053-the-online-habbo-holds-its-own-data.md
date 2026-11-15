---
type: Decision
title: The online habbo holds its badges, its sound setting and its fuses
description: game.Login loads the habbo's badges, sound setting and fuses into virtual/habbo; the wallet and the club, which the user's habbos share, are read from the store when the client asks.
status: accepted
timestamp: 2026-11-10T02:32:11+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:32:11+00:00"}
tags: [server, virtual]
---

# Decision

- `game.Login` loads into the online habbo of `virtual/habbo` its badges, the one it wears, its sound setting and its
  fuses, besides its avatar ([0009](/decisions/server/0009-virtual-holds-the-server-state.md)).
- A change writes the store, then the copy ([0010](/decisions/server/0010-hot-data-written-at-once.md)), as
  `SET_SOUND_SETTING` does.
- The wallet and the club belong to the user, whose habbos share them, so the credits, the tickets, the film and the
  club status are read from the store when the client asks.

# Context

Offered the habbo's own data at login or every answer read when asked, the user chose "Habbo's own data
(Recommended)": "game.Login also loads the habbo's badges, its sound setting and its fuses into virtual/habbo;
SET_SOUND_SETTING writes the store, then the copy (0010). The wallet and the club belong to the user, whose habbos
share them, so credits, tickets, film and the club status are read from the store when the client asks."

# Consequences

- s2-07 loads them.
