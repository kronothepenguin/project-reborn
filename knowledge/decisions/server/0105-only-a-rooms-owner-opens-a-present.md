---
type: Decision
title: Only a room's owner opens a present
description: A box that stands in a habbo room is opened by the room's owner alone, into whose hand its furni goes, as in Holo; the staff fuse for which the client shows the button opens nothing.
status: accepted
timestamp: 2026-11-11T17:28:49+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T17:28:49+00:00"}
tags: [server, furni, presents]
---

# Decision

- Only the owner of the habbo room a box stands in opens it, and what is inside goes to the owner's hand.
- Whoever may pick the box up may open it: a holder of `fuse_any_room_controller` counts as the owner, as everywhere
  ([0103](/decisions/server/0103-whoever-picks-a-furni-up-keeps-it.md)).
- `fuse_pick_up_any_furni`, for which the client shows its Open button too, opens nothing.

# Context

Holo let only the room's owner open a box. Offered that, or the owner and the staff who hold `fuse_pick_up_any_furni`,
as the client's button, the user chose "Only the room's owner, as Holo (Recommended)": "Holo let only the owner of the
room open a box, and what is inside goes to the owner's hand. It fits your pick-up rule: whoever may pick the box up may
open it. Example: Ana places her present in her own room and opens it; in Bob's room, only Bob could."

# Consequences

- s5-06 applies it.
