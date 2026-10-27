---
type: Entity
title: Habbo
description: An in-hotel identity owned by a user, with its name, look, motto, badges and wardrobe.
tags: [store, entity, habbo]
timestamp: 2026-10-27T21:17:19+00:00
---

# Definition

A habbo (table `avatars`) is what other people see: the name used to sign in, the figure, the gender and the
motto. A user can own several habbos; club membership, credits and the home page are per habbo.

# Invariants

- The name is unique, ignoring case.
- Gender is `M` or `F`.
- The figure uses the dot format written by the v2 avatar editor (`hd-180-1.ch-215-82.lg-270-82`).
- At most one badge is worn.
- Wardrobe slots start at 1; the upper bound is `homes.wardrobeSlots` in config.

# Lifecycle

- Created with its user at registration, or later from Account → Habbos.
- Look, gender and motto change from the account settings; badges come from staff or club purchases.
- Deleting a habbo deletes its badges, outfits, the sessions where it is active and its SSO tickets, and clears it
  as display habbo, referrer and login-attempt habbo.

# Vocabularies

- `avatar_badges.code`: badge codes known to the client (for example `HC1`); the store does not restrict them.

# Relations

- Owned by a [user](/entities/user.md).
- Active in [sessions](/entities/session.md).
- Shown for a member of an [access group](/entities/access-group.md) on the staff page.
- Can refer new users ([referral](/entities/referral.md)).

# Tables

- [avatars](/tables/avatars.md)
- [avatar_badges](/tables/avatar_badges.md)
- [wardrobe_outfits](/tables/wardrobe_outfits.md)
