---
type: Phase
title: S5 Furni, catalogue and trading
description: Habbos buy furni in the catalogue, keep it in their hand, place, move and use it in rooms, trade it and recycle it.
status: active
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s5, server]
---

# Goal

Habbos buy furni in the catalogue, keep it in their hand, place, move, rotate, pick up and use it in rooms, open
presents, trade with each other and recycle furni.

# Scope

| Client | Reference | Parts |
| --- | --- | --- |
| `hh_cat_code` | [s1-09](/tasks/s1-09-catalogue.md) | The catalogue's pages and purchases |
| `hh_room` | [s1-06](/tasks/s1-06-room.md) | Floor and wall items, the hand, placing, moving and picking up, furni state, dice, presents, post-its, teleports, rollers, trading, furni turned into credits |
| `hh_room_utils` | [s1-07](/tasks/s1-07-room-utils.md) | One-way doors |
| `hh_buffer` | [s1-08](/tasks/s1-08-buffer.md) | Updates to active objects and items, which need nothing of their own from the server |
| `hh_recycler` | [s1-17](/tasks/s1-17-recycler.md) | The recycler |

- Furni belongs to users: a habbo's hand, a shared inventory per user, and placed items in rooms
  (`plans/holo-port/decisions/0057-furni-and-rooms.md`).
- Saved: placed furni and furni state ([0011](/decisions/0011-saved-and-memory-only-data.md)), and a recycling
  ([0093](/decisions/0093-a-recycling-is-saved.md)). Only in memory: an open trade
  ([0092](/decisions/0092-a-trade-lives-only-in-memory.md)).
- A hotel starts with Holo's catalogue, changed by database updates
  ([0091](/decisions/0091-holos-catalogue-changed-by-updates.md)). The store keeps it as furni definitions and catalogue
  items ([0097](/decisions/0097-furni-definitions-and-catalogue-items-apart.md)), which load at start into
  `virtual/furni` and `virtual/catalogue` ([0098](/decisions/0098-virtual-furni-and-catalogue.md)).
- The hand is read from the database each time ([0096](/decisions/0096-the-hand-is-read-from-the-database.md)), and any
  habbo sends a present to any habbo ([0094](/decisions/0094-any-habbo-sends-a-present-to-any-habbo.md)).
- On the site, S5 builds item vouchers, the shared inventory page, housekeeping's Recycler Options and the dashboard's
  counts ([0095](/decisions/0095-s5-builds-four-site-pieces.md)).
- Pets, photos, the sound machine and the room dimmer are [S7](/phases/s7-club-help-extras.md)'s.

# Exit criteria

- A new hotel has Holo's catalogue: Go test clients open it, read its pages and buy a furni, a deal, a trophy and a
  wallpaper; the user's wallet pays, and the credit history shows each purchase.
- What is bought lands in the buyer's hand, read from the database; a present lands in the receiver's hand in a box, and
  opens in a room.
- Habbos with rights place, move and turn furni, and it is picked up again; habbos walk around it, sit on seats and lie
  on beds, and rollers move them; furni and its state come back after the room unloads and after a restart.
- Dice, wheels, gates, drinks, post-its, teleports and decorations work as the client shows them, and credit furni turns
  into credits.
- Two habbos trade furni in a room, and a trade cut short loses nothing.
- A habbo recycles furni for a reward, and a recycling survives a restart.
- On the site, a habbo redeems an item voucher and takes furni from the shared inventory, and housekeeping has Recycler
  Options and the dashboard's counts of rooms and furni.
- Every gate passes.

# Tasks

1. [s5-01 Add the furni definitions and the catalogue to the store](/tasks/s5-01-catalogue-tables.md) **done**
2. [s5-02 Load the furni definitions and the catalogue in virtual](/tasks/s5-02-catalogue-state.md) **done**
3. [s5-03 Show the catalogue](/tasks/s5-03-showing-the-catalogue.md) **done**
4. [s5-04 Keep furni in the hand](/tasks/s5-04-the-hand.md) **done**
5. [s5-05 Buy furni](/tasks/s5-05-buying-furni.md)
6. [s5-06 Send and open presents](/tasks/s5-06-presents.md)
7. [s5-07 Show a room's furni and walk around it](/tasks/s5-07-furni-in-rooms.md)
8. [s5-08 Place, move, turn and pick up furni](/tasks/s5-08-placing-furni.md)
9. [s5-09 Use furni](/tasks/s5-09-using-furni.md)
10. [s5-10 Move furni and habbos on rollers](/tasks/s5-10-rollers.md)
11. [s5-11 Decorate a room](/tasks/s5-11-decorating-a-room.md)
12. [s5-12 Write post-its](/tasks/s5-12-post-its.md)
13. [s5-13 Travel through teleports](/tasks/s5-13-teleports.md)
14. [s5-14 Trade furni](/tasks/s5-14-trading.md)
15. [s5-15 Turn credit furni into credits](/tasks/s5-15-credit-furni.md)
16. [s5-16 Recycle furni](/tasks/s5-16-recycler.md)
17. [s5-17 Port housekeeping's Recycler Options](/tasks/s5-17-recycler-options-page.md)
18. [s5-18 Redeem item vouchers on the site](/tasks/s5-18-item-vouchers.md)
19. [s5-19 Show the shared inventory on the site](/tasks/s5-19-shared-inventory-page.md)
20. [s5-20 Count rooms and furni on housekeeping's dashboard](/tasks/s5-20-dashboard-counts.md)
21. [s5-21 Check S5's exit criteria](/tasks/s5-21-exit-check.md)
22. [s5-22 Copy one prepared database for each CMS and housekeeping test](/tasks/s5-22-test-databases.md) **done**
