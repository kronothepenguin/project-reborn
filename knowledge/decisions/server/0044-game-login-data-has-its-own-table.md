---
type: Decision
title: What the game server saves of a habbo has a table of its own
description: The last time online, the machine id of the last game login and the sound setting live in avatar_game_data, one row per habbo, not in columns of avatars, which many queries read whole.
status: accepted
timestamp: 2026-11-09T23:20:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T23:20:00+00:00"}
tags: [server, data]
---

# Decision

- A habbo's last time online, the machine id of its last game login and its sound setting
  ([0035](/decisions/server/0035-the-machine-id-is-saved-per-habbo.md), [0037](/decisions/server/0037-last-online-at-login-and-logout.md),
  [0038](/decisions/server/0038-the-sound-setting-is-saved.md)) live in `avatar_game_data`, one row per habbo keyed by
  `avatar_id`, as `wallets` is per user.
- A habbo that never logged in to the game has no row.
- The update that adds the table waits for an administrator, as the other updates do.

# Context

Columns of `avatars` broke every query that reads `avatars` whole, such as `CreateAvatar` and `GetAvatar`, while their
update waits, so the tests of the update page could not even create a habbo. Offered a table of their own, or columns
with an automatic update, the user chose "Own table (Recommended)": "A table of their own, one row per habbo keyed by
avatar_id, as wallets is per user. No existing query changes, and 0007 waits for an administrator like the other
updates. Example: avatar_game_data(avatar_id, last_online_at, machine_id, sound_enabled)."

# Consequences

- s2-03 adds the table, and the game server writes it.
