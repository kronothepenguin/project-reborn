---
type: SQL Update
title: 0009-holo-fuses.sql
description: Gives every access group the game fuses Holo's ranks held up to the group's level, from fuse_use_club_dance at level 2 to fuse_see_flat_ids at level 7.
resource: packages/store/migrations/0009-holo-fuses.sql
tags: [store, update, access, game]
timestamp: 2026-11-10T01:52:00+00:00
---

# Update

| | |
|---|---|
| Title | The game's fuses Holo's ranks held, for every access group whose level reaches the rank. |
| Automatic | no |

Adds rows to [access_group_attributes](/tables/access_group_attributes.md) for the game fuses of the catalogue in
`packages/auth`, keeping the rows already there. Each fuse goes to every group whose level reaches the `minrank` it has
in `system_fuserights` of Holo's newest dump, `source/holoemu/database.sql`, since a group's level is Holo's rank
number; the fuses that dump does not rank go to level 7
(`plans/server/decisions/0046-the-first-fuses-follow-holos-ranks.md`).

| Level | Fuses it adds |
|---|---|
| 2 | `fuse_use_club_dance`, `fuse_use_special_room_layouts`, `fuse_habbo_chooser`, `fuse_furni_chooser` |
| 3 | `fuse_room_alert`, `fuse_enter_full_rooms` |
| 4 | `fuse_alert`, `fuse_kick`, `fuse_mute`, `fuse_enter_locked_rooms` |
| 5 | `fuse_remove_stickies`, `fuse_ban`, `fuse_room_kick`, `fuse_room_mute`, `fuse_receive_calls_for_help`, `fuse_see_all_roomowners` |
| 6 | `fuse_any_room_controller`, `fuse_performance_panel`, `fuse_pick_up_any_furni`, `fuse_superban`, `fuse_moderator_access`, `fuse_teleport` |
| 7 | `fuse_see_flat_ids`, `fuse_administrator_access`, `fuse_freeze`; unranked: `fuse_cancel_roomevent`, `fuse_catalog_editor`, `fuse_credits`, `fuse_debug_window`, `fuse_remove_photos`, `fuse_see_chat_log_link` |

A group holds every fuse of its level and the levels below, so a new hotel's ranks of
[0003-ranks.sql](/migrations/0003-ranks.md) get 6 (HabboX), 10 (Silver Hobba), 16 (Gold Hobba), 22 (Moderator) and all
31 (Administrator). A hotel's own groups get them by their level as well, and a group below level 2 gets none.
