---
type: Entity
title: Club subscription
description: A paid Habbo Club period of a user; club membership covers all their habbos and is not an access attribute.
tags: [store, entity, club]
timestamp: 2026-11-02T01:44:15+00:00
---

# Definition

A user is a club member while one of their periods covers the current time, and all their habbos are members with
them. Days left come from the latest
`ends_at`; total club time is the sum of the periods.

# Invariants

- A period ends after it starts.
- A new purchase starts at the later of now and the current latest `ends_at`, so periods never overlap.
- A purchase is limited by `club.maxMonths` and priced by `club.price*` (validated in Go).

# Lifecycle

- A purchase debits the wallet, writes a `club` ledger row, inserts the period and, on the first purchase, grants
  the club badge, all in one transaction.
- Periods are never updated; deleting the user deletes them.

# Vocabularies

None.

# Relations

- Belongs to a [user](/entities/user.md); paid from their [wallet](/entities/wallet.md).

# Tables

- [club_subscriptions](/tables/club_subscriptions.md)
