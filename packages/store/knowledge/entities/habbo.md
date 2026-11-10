---
type: Entity
title: Habbo
description: An in-hotel identity owned by a user, with its name, look, motto, badges and wardrobe.
tags: [store, entity, habbo]
timestamp: 2026-11-10T20:23:05+00:00
---

# Definition

A habbo (table `avatars`) is what other people see: the name used to sign in, the figure, the gender and the
motto. A user can own several habbos, which share the user's wallet, club membership and home inventory; the home page is per habbo.

# Invariants

- The name is unique, ignoring case.
- Gender is `M` or `F`.
- The figure uses the dot format written by the v2 avatar editor (`hd-180-1.ch-215-82.lg-270-82`).
- It wears up to five badges, one in each slot 1 to 5; the site shows the first slot filled.

# Lifecycle

- Created with its user at registration, or later from Account → Habbos.
- Look, gender and motto change from the account settings; badges come from staff, and `HC1` from the user's club
  purchases, leaving with the club.
- The owner archives a habbo from Account → Habbos, and staff restore it. An archived habbo cannot sign in, leaves the
  lists and the limit of `registration.maxHabbosPerUser`, and keeps its rows and its name. The stickers and notes on its
  home go back to the user's inventory, notes without their text.
- The game server writes its last time online at each login and logout, the machine id of each login, and its sound
  setting when the game client changes it.
- Deleting a habbo deletes its badges, outfits, the sessions where it is active and its SSO tickets, and clears it
  as display habbo, referrer and login-attempt habbo.

# Vocabularies

- `avatar_badges.code`: badge codes known to the client (for example `HC1`); the store does not restrict them.

# Relations

- Owned by a [user](/entities/user.md).
- Active in [sessions](/entities/session.md).
- Shown for a member of an [access group](/entities/access-group.md) on the staff page.
- Can refer new users ([referral](/entities/referral.md)).
- Has a [profile](/entities/profile.md), and shares the user's [wallet](/entities/wallet.md), [club subscriptions](/entities/club-subscription.md)
  and a [home store](/entities/home-store.md) inventory.
- Owns and joins [groups](/entities/group.md); writes [forum threads](/entities/forum-thread.md); receives
  [alerts](/entities/alert.md).
- Keeps [wardrobe outfits](/entities/wardrobe-outfit.md) and redeems [vouchers](/entities/voucher.md).
- Creates and owns [rooms](/entities/room.md), and keeps [favourite rooms](/entities/favourite-room.md).
- Says [chat messages](/entities/chat-message.md), and keeps an ignore list of other habbos.

# Tables

- [avatars](/tables/avatars.md)
- [avatar_game_data](/tables/avatar_game_data.md)
- [ignored_habbos](/tables/ignored_habbos.md)
- [avatar_badges](/tables/avatar_badges.md)

# Queries

- [avatars.query.sql](/queries/avatars.md)
