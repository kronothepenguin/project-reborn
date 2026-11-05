---
type: Entity
title: Group
description: A group bought by a habbo, with a badge, an access mode, members, admins, pending requests and a home.
tags: [store, entity, groups]
timestamp: 2026-11-05T19:25:27+00:00
---

# Definition

Groups are created by habbos for credits. Members join directly, or by request for moderated groups; admins
manage members and the group home.

# Invariants

- The name is unique, ignoring case.
- The owner also has an `admin` membership row, written in the same transaction as the group.
- The owner's row is never demoted or removed, and the owner never leaves.
- A habbo has at most one favourite group, among the groups it has joined.
- A pending request has `joined_at` NULL; accepting and declining touch only requests.
- Limits come from `groups.*`: the groups the habbos of one user own together, the memberships and requests of one
  habbo, the members of a Regular group, and the lengths of the name and the description.
- Archived habbos are left out of every list and count of members and requests, and keep their rows.

# Lifecycle

- Purchase: wallet debit, `group` ledger row, group, owner membership and group home with its `group_info` widget in
  one transaction.
- Settings are changed by the owner, and the badge by admins; members are accepted, promoted, demoted or removed by
  admins.
- A type leaving `moderated` removes the waiting requests at once.
- An `unlimited` group never changes type again.
- Deleting the group returns its home's stickers and notes to the users whose habbos placed them, then deletes its
  memberships and home.

# Vocabularies

| Column | Values |
|--------|--------|
| `groups.access` | `open` (Regular), `moderated` (Exclusive), `closed` (Private), `unlimited` (Unlimited) |
| `group_members.role` | `member`, `admin` |
| `groups.badge` | badge code: `b` + base (2-digit shape, 2-digit colour), then up to four `s` + symbol parts (2-digit template, 2-digit colour, 1-digit position 0–8), e.g. `b0503Xs09114s05013s05015` |

# Relations

- Owned by a [habbo](/entities/habbo.md); has a [home](/entities/home.md); paid from a
  [wallet](/entities/wallet.md).

# Tables

- [groups](/tables/groups.md)
- [group_members](/tables/group_members.md)

# Queries

- [groups.query.sql](/queries/groups.md)
