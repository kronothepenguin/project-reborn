---
type: Decision
title: The first fuses follow Holo's ranks by level
description: An update gives every access group the fuses Holo's ranks held up to the group's level, with the ranks of Holo's newest dump, and level 7 for the fuses that dump does not rank.
status: accepted
timestamp: 2026-11-10T02:01:18+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:01:18+00:00"}
tags: [server, auth, rights, data]
---

# Decision

- The update `packages/store/migrations/0009-holo-fuses.sql` gives each fuse of the catalogue
  ([0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md)) to every access group whose level reaches
  the fuse's `minrank` in `system_fuserights` of `source/holoemu/database.sql`, Holo's newest dump, since a group's level
  is Holo's rank number (`plans/holo-port/decisions/0055-staff-levels.md`).
- The fuses that dump does not rank go to level 7: `fuse_cancel_roomevent`, `fuse_catalog_editor`,
  `fuse_debug_window`, `fuse_remove_photos` and `fuse_see_chat_log_link`, which no dump ranks, and `fuse_credits`,
  which only the oldest dump, `Resources/holodb.sql`, ranks (6).

| Level | Fuses |
| --- | --- |
| 2 | `fuse_use_club_dance`, `fuse_use_special_room_layouts`, `fuse_habbo_chooser`, `fuse_furni_chooser` |
| 3 | `fuse_room_alert`, `fuse_enter_full_rooms` |
| 4 | `fuse_alert`, `fuse_kick`, `fuse_mute`, `fuse_enter_locked_rooms` |
| 5 | `fuse_remove_stickies`, `fuse_ban`, `fuse_room_kick`, `fuse_room_mute`, `fuse_receive_calls_for_help`, `fuse_see_all_roomowners` |
| 6 | `fuse_any_room_controller`, `fuse_performance_panel`, `fuse_pick_up_any_furni`, `fuse_superban`, `fuse_moderator_access`, `fuse_teleport` |
| 7 | `fuse_see_flat_ids`, `fuse_administrator_access`, `fuse_freeze`, and the six above |

- A group holds the fuses of its level and the levels below. A new hotel's ranks
  (`plans/holo-port/decisions/0054-access-groups-are-holos-ranks.md`) get 6 (HabboX), 10 (Silver Hobba), 16 (Gold
  Hobba), 22 (Moderator) and all 31 (Administrator); a hotel's own groups get them by their level too, and a group below
  level 2 gets none.
- The update is not automatic: neither sign-in nor housekeeping's access check reads fuses.

# Context

Asked which groups should hold the fuses when the update runs, the user chose "Holo's ranks by level (Recommended)":
"Each fuse goes to the groups whose level reaches its rank in Holo's newest dump (database.sql). Example: fuse_kick (rank
4) to Silver Hobba, Gold Hobba, Moderator and Administrator; fuse_see_flat_ids (rank 7) to Administrator only. Fuses Holo
never ranked (fuse_debug_window, fuse_catalog_editor…) go to level 7."

# Consequences

- [s2-04](/tasks/s2-04-fuse-catalogue.md) adds the update.
