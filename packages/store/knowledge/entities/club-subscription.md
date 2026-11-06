---
type: Entity
title: Club subscription
description: A paid Habbo Club period of a user; club membership covers all their habbos and is not an access attribute.
tags: [store, entity, club]
timestamp: 2026-11-06T22:56:10+00:00
---

# Definition

A user is a club member while one of their periods covers the current time, and all their habbos are members with
them. Days left come from the latest `ends_at`; total club time is the sum of the periods.

# Invariants

- A period ends after it starts.
- A new purchase starts at the later of now and the end of the user's last period, so periods never overlap and a
  purchase made during the club follows the running period.
- A purchase is limited by `club.maxMonths` and priced by `club.price*` (validated in Go).

# Lifecycle

- A purchase debits the wallet, writes a `club` ledger row, inserts the period and gives the club badge `HC1`, unworn,
  to every habbo of the user that lacks it, archived ones too, since they are still the user's. The habbo that buys
  wears it at once, taking off the badge it wore. All of it happens in one transaction (0103).
- When the site reads the club of a user whose periods have all ended, `HC1` leaves every habbo of the user, as Holo's
  `IsHCMember` took it away; a user with no period keeps an `HC1` that staff gave.
- Periods are never updated; deleting the user deletes them.

# Vocabularies

None.

# Relations

- Belongs to a [user](/entities/user.md); paid from their [wallet](/entities/wallet.md).
- Gives `HC1` to the user's [habbos](/entities/habbo.md), and opens the club [wardrobe](/entities/wardrobe-outfit.md).

# Tables

- [club_subscriptions](/tables/club_subscriptions.md)

# Queries

- [club.query.sql](/queries/club.md)
- [avatars.query.sql](/queries/avatars.md), for `HC1` on every habbo of the user
