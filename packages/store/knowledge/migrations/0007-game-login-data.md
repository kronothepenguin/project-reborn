---
type: SQL Update
title: 0007-game-login-data.sql
description: Creates avatar_game_data, where the game server saves each habbo's last time online, the machine id of its last game login and its sound setting.
resource: packages/store/migrations/0007-game-login-data.sql
tags: [store, update, habbo, game]
timestamp: 2026-11-09T22:45:00+00:00
---

# Update

| | |
|---|---|
| Title | Each habbo's last time online, the machine id of its last game login, and its sound setting, which the game server saves. |
| Automatic | no |

Creates [avatar_game_data](/tables/avatar_game_data.md), a row per habbo for its last time online, the machine id
of its last game login and its sound setting, which the game server writes
(`plans/server/decisions/0035-the-machine-id-is-saved-per-habbo.md`,
`plans/server/decisions/0037-last-online-at-login-and-logout.md` and
`plans/server/decisions/0038-the-sound-setting-is-saved.md`). It is a table of its own, so nothing that reads
[avatars](/tables/avatars.md) fails while the update waits
(`plans/server/decisions/0044-game-login-data-has-its-own-table.md`).
