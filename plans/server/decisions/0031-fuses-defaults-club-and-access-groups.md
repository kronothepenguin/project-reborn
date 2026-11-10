---
type: Decision
title: A habbo's fuses: a default set, club fuses, and staff fuses from access groups
description: Every habbo gets fuse_trade and fuse_buy_credits, club members also fuse_use_club_dance and fuse_use_special_room_layouts, and the other 14 fuses the client checks come from access groups, through a fuse catalogue beside the site's attributes.
status: superseded
superseded_by: "0045"
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, auth, rights]
---

# Decision

- Every habbo gets `fuse_trade` and `fuse_buy_credits`.
- A club member also gets `fuse_use_club_dance` and `fuse_use_special_room_layouts`.
- The other 14 fuses the client checks come from access groups, through a fuse catalogue beside the site's attributes
  in `packages/auth`: `fuse_alert`, `fuse_any_room_controller`, `fuse_cancel_roomevent`, `fuse_catalog_editor`,
  `fuse_debug_window`, `fuse_furni_chooser`, `fuse_habbo_chooser`, `fuse_kick`, `fuse_performance_panel`,
  `fuse_pick_up_any_furni`, `fuse_remove_photos`, `fuse_remove_stickies`, `fuse_see_chat_log_link` and
  `fuse_see_flat_ids`.

# Context

`plans/holo-port/decisions/0015-attribute-names-and-fuses.md` keeps the fuses' exact names in a separate catalogue,
designed together with the game server. The client's scripts check 18 fuses. Offered a default set with access groups,
or the same few fuses for everyone until a later phase, the user chose "Defaults + access groups (Recommended)": "Every
habbo gets fuse_trade and fuse_buy_credits; club members also fuse_use_club_dance and fuse_use_special_room_layouts.
The other 14, the staff fuses such as fuse_kick and fuse_alert, come from access groups, through a fuse catalogue
beside the site's attributes."

# Consequences

- [s2-04](/tasks/s2-04-fuse-catalogue.md) adds the catalogue, and
  [s2-07](/tasks/s2-07-after-login.md) sends a habbo's fuses.
