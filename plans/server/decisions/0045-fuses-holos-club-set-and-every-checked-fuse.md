---
type: Decision
title: "A habbo's fuses: everyone's two, Holo's club set, and every checked fuse from access groups"
description: Every habbo gets fuse_trade and fuse_buy_credits, a club member also the club dance, the special room layouts and the habbo and furni choosers, as Holo's rank 2 did, and access groups grant the 31 fuses the client or Holo's server checks, through a fuse catalogue beside the site's attributes.
status: accepted
timestamp: 2026-11-10T02:01:18+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:01:18+00:00"}
tags: [server, auth, rights]
---

# Decision

- Every habbo gets `fuse_trade` and `fuse_buy_credits`.
- A club member also gets `fuse_use_club_dance`, `fuse_use_special_room_layouts`, `fuse_habbo_chooser` and
  `fuse_furni_chooser`, as Holo's rank 2, Habbo Club, did.
- Access groups grant, through a fuse catalogue beside the site's attributes in `packages/auth`, every other fuse that
  the client or Holo's server checks, each with what it allows in the game, 31 in all:
  - the 14 staff fuses the client checks: `fuse_alert`, `fuse_any_room_controller`, `fuse_cancel_roomevent`,
    `fuse_catalog_editor`, `fuse_debug_window`, `fuse_furni_chooser`, `fuse_habbo_chooser`, `fuse_kick`,
    `fuse_performance_panel`, `fuse_pick_up_any_furni`, `fuse_remove_photos`, `fuse_remove_stickies`,
    `fuse_see_chat_log_link` and `fuse_see_flat_ids`;
  - the 15 only Holo's server checks: `fuse_administrator_access`, `fuse_ban`, `fuse_credits`, `fuse_enter_full_rooms`,
    `fuse_enter_locked_rooms`, `fuse_freeze`, `fuse_moderator_access`, `fuse_mute`, `fuse_receive_calls_for_help`,
    `fuse_room_alert`, `fuse_room_kick`, `fuse_room_mute`, `fuse_see_all_roomowners`, `fuse_superban` and
    `fuse_teleport`;
  - `fuse_use_club_dance` and `fuse_use_special_room_layouts`, so that staff without club keep them, as Holo's staff
    ranks did.
- Fuses come from access groups only: a user is never given one directly.
- The 11 names of Holo's database that neither the client nor Holo's server checks stay out: `default`, `fuse_login`,
  `fuse_room_queue_default`, `fuse_extended_buddylist`, `fuse_room_queue_club`, `fuse_priority_access`, `fuse_mod`,
  `fuse_ignore_room_owner`, `fuse_chat_log`, `fuse_hotelalert` and `fuse_guide`.
- The server checks each fuse of Holo's server when the phase of its feature comes: `fuse_see_all_roomowners` in
  [S3](/phases/s3-navigator.md), `fuse_enter_locked_rooms` and `fuse_enter_full_rooms` in [S4](/phases/s4-rooms.md),
  and `fuse_receive_calls_for_help` and the mod tool's `fuse_ban`, `fuse_superban`, `fuse_room_alert` and
  `fuse_room_kick` in [S7](/phases/s7-club-help-extras.md). Holo's chat commands, behind `fuse_mute`, `fuse_room_mute`,
  `fuse_moderator_access`, `fuse_administrator_access`, `fuse_teleport`, `fuse_credits` and `fuse_freeze`, belong to no
  phase yet and wait in `plans/later.md`.

# Context

[0031](/decisions/0031-fuses-defaults-club-and-access-groups.md) took the 14 staff fuses the client checks. Asked which
groups should hold them first, the user answered: "please analyze the holo emulator source, you will find many fuses
there, same for the database...". The analysis is in [The Holograph Emulator](/reference/holoemu.md#fuses).

Offered every fuse something checks, every name of Holo's dumps, or the client's 14, the user chose "Every checked fuse
(Recommended)": "The client's 14 and Holo's server's 15, 29 in all. Our server checks each one when the phase of its
feature comes (S3 navigator, S4 rooms, S7 mod tool and calls for help); Holo's chat commands (:ha, :teleport, :freeze)
have no phase yet and go to plans/later.md. The 11 unchecked names stay out."

Told that Holo's rank 2, Habbo Club, also gives the choosers and that every staff rank inherits the four club fuses, the
user chose "As Holo (Recommended)": "Club members get fuse_use_club_dance, fuse_use_special_room_layouts,
fuse_habbo_chooser and fuse_furni_chooser. The four can also be ticked for groups and go to level 2 and up, so a
moderator without club can still use the club dances."

# Consequences

- Supersedes [0031](/decisions/0031-fuses-defaults-club-and-access-groups.md).
- [s2-04](/tasks/s2-04-fuse-catalogue.md) adds the catalogue, and [s2-07](/tasks/s2-07-after-login.md) sends a habbo's
  fuses.
- [0046](/decisions/0046-the-first-fuses-follow-holos-ranks.md) says which groups hold them first.
