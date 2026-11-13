---
type: Decision
title: A hotel starts with Holo's categories, public rooms and room models
description: An update seeds Holo's English categories, its 12 public rooms with their casts and its 42 room models; BattleBall and SnowStorm wait for S8.
status: accepted
timestamp: 2026-11-10T03:39:13+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:39:13+00:00"}
tags: [server, navigator, data]
---

# Decision

- An update of the store seeds what the navigator shows on a new hotel, from the Holograph Emulator's dumps:
  - the categories of `source/holoemu/Resources/holodb.sql`, the dump whose names are English: Public Rooms, with
    Outside spaces, Entertainment, The Park & Infobus and Clubs & bars; and Guestrooms, with No category, Trade rooms,
    Theme Rooms, Chil Rooms, Games and Fun, HelpDesk, Donation, Staff's Rooms and Moderators Rooms. Each keeps Holo's
    minimum rank as the access group level a habbo needs, 7 for Staff's Rooms and 6 for Moderators Rooms, and its
    trading flag;
  - the 12 public rooms of `source/holoemu/holodb.sql` that are not games: Welcome Lounge, Pool A, Pool B, The Library,
    The Sunset Cafe, The Pub, Floatinggarden, Rooftop Rumble, Picnic Fields, The Park, The Infobus and the Holoween
    theatre, each with its model, the casts it loads and its most visitors;
  - its 42 room models, `room_modeldata`: the habbo rooms' models `a` to `r` and the public rooms', each with its door,
    heightmap and public furni.
- BattleBall and SnowStorm, their categories and their lobbies, wait for S8. The pool
  triggers, `room_modeldata_triggers`, wait for the phase that serves the pools.
- The public rooms' casts are files of the client that the user adds (`plans/client`'s C1).

# Context

The repository has no categories, public rooms or room models, and the client keeps none of them. Offered Holo's set,
or only its models and the two root categories, the user chose "Holo's set (Recommended)": "An update seeds Holo's
English categories (Public Rooms with Outside spaces, Entertainment, The Park & Infobus, Clubs & bars; Guestrooms with
No category, Trade rooms, Theme Rooms, Chil Rooms, Games and Fun, HelpDesk, Donation, and Staff's and Moderators Rooms
for levels 7 and 6), its 12 public rooms (Welcome Lounge, two pools, Library, Sunset Cafe, Pub, Park, Infobus…) and
its 42 models (guest models a–r and the public rooms'). BattleBall and SnowStorm wait for S8."

# Consequences

- s3-01 writes the update.
