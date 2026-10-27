---
type: Entity
title: Club subscription
description: A paid Habbo Club period of a habbo; club membership is a habbo property, not an access attribute.
tags: [store, entity, club]
timestamp: 2026-10-27T21:28:26+00:00
---

# Definition

A habbo is a club member while one of its periods covers the current time. Days left come from the latest
`ends_at`; total club time is the sum of the periods.

# Invariants

- A period ends after it starts.
- A new purchase starts at the later of now and the current latest `ends_at`, so periods never overlap.
- A purchase is limited by `club.maxMonths` and priced by `club.price*` (validated in Go).

# Lifecycle

- A purchase debits the wallet, writes a `club` ledger row, inserts the period and, on the first purchase, grants
  the club badge, all in one transaction.
- Periods are never updated; deleting the habbo deletes them.

# Vocabularies

None.

# Relations

- Belongs to a [habbo](/entities/habbo.md); paid from its [wallet](/entities/wallet.md).

# Tables

- [club_subscriptions](/tables/club_subscriptions.md)
