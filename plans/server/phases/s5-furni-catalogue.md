---
type: Phase
title: S5 Furni, catalogue and trading
description: Habbos buy furni in the catalogue, keep it in their hand, place, move and use it in rooms, trade it and recycle it.
status: planned
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s5, server]
---

# Goal

Habbos buy furni in the catalogue, keep it in their hand, place, move, rotate, pick up and use it in rooms, open
presents, trade with each other and recycle furni.

# Scope

| Client | Reference | Parts |
| --- | --- | --- |
| `hh_cat_code` | [s1-09](/tasks/s1-09-catalogue.md) | The catalogue's pages and purchases, pets for sale |
| `hh_room` | [s1-06](/tasks/s1-06-room.md) | Floor and wall items, the hand, placing, moving and picking up, furni state, dice, presents, stickies, teleports, trading, furni turned into credits |
| `hh_buffer` | [s1-08](/tasks/s1-08-buffer.md) | Updates to active objects and items |
| `hh_recycler` | [s1-17](/tasks/s1-17-recycler.md) | The recycler |

- Furni belongs to users: a habbo's hand, a shared inventory per user, and placed items in rooms
  (`plans/holo-port/decisions/0057-furni-and-rooms.md`).
- Saved: placed furni and furni state ([0011](/decisions/0011-saved-and-memory-only-data.md)). The furni definitions
  and the catalogue are shared data, loaded at start ([0009](/decisions/0009-virtual-holds-the-server-state.md)).

# Exit criteria

Written with the phase's tasks, once its open questions are answered.

# Tasks

Written when the phase starts.

# Open questions

- Where the catalogue and the furni definitions come from (pages, prices, sprites, sizes), and who edits them.
- Whether a trade in progress lives only in memory.
- What waits in the recycler, and whether it survives a restart.
- How the site's vouchers (`vouchers` table) and the client's purchases meet.
- Who can send presents, and what is saved about them.
