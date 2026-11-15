---
type: Decision
title: Habbos with rights write post-its; the owner and staff with the fuse delete them
description: Habbos with rights in a room write a post-it and change its colour, only the room's owner deletes one, as Holo, and staff holding fuse_remove_stickies delete any note, which Holo ignored.
status: accepted
timestamp: 2026-11-11T18:05:11+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T18:05:11+00:00"}
tags: [server, furni, post-its, fuses]
---

# Decision

- A habbo with rights in a room writes a post-it and changes its colour.
- Only the room's owner deletes a post-it, and staff holding `fuse_any_room_controller` count as the owner, as
  everywhere.
- Staff holding `fuse_remove_stickies` delete any post-it too.

# Context

Holo let habbos with rights write and only the owner delete; the R26 client also shows the delete button to a habbo
holding `fuse_remove_stickies`, which Holo never checked. Offered Holo's rule with the fuse, Holo's rule exactly, or the
owner alone writing too, the user chose "As Holo, plus the staff fuse (Recommended)": "Habbos with rights in the room
write a note and change its colour; only the room's owner deletes one. Staff holding fuse_remove_stickies also delete
any note: the client already shows them the delete button, and Holo ignored it."

# Consequences

- s5-12 builds it.
