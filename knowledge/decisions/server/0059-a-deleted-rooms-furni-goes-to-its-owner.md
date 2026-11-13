---
type: Decision
title: A deleted room's furni goes to its owner's hand
description: When a habbo deletes a room, the furni in it goes to the hand of the habbo that owns the room, so nothing bought is lost.
status: accepted
timestamp: 2026-11-10T03:39:13+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:39:13+00:00"}
tags: [server, rooms, furni]
---

# Decision

- When a habbo deletes a room (`DELETEFLAT`), the furni placed in it goes to the hand of the habbo that owns the room.

# Context

Holo deleted the furni with the room, and `knowledge/decisions/holo-port/0057-furni-and-rooms.md` makes every furni item
belong to a user. Offered the owner's hand, deleting it with the room, or the user's shared inventory, the user chose
"To the owner's hand (Recommended)": "The room's furni goes to the hand of the habbo that owns the room, so nothing
bought is lost. Example: deleting a room with a sofa and a lamp puts both in the owner's hand."

# Consequences

- Rooms hold no furni until S5: s3-07 deletes the
  room, and S5's furni moves to the owner's hand from then on.
