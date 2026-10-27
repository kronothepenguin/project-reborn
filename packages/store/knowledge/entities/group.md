---
type: Entity
title: Group
description: A group bought by a habbo, with a badge, an access mode, members, admins, pending requests and a home.
tags: [store, entity, groups]
timestamp: 2026-10-27T21:28:26+00:00
---

# Definition

Groups are created by habbos for credits. Members join directly, or by request for moderated groups; admins
manage members and the group home.

# Invariants

- The name is unique, ignoring case.
- The owner also has an `admin` membership row, written in the same transaction as the group.
- A habbo has at most one favourite group.
- A pending request has `joined_at` NULL.
- Limits come from `groups.*` (owned groups, memberships, members, name and description length).

# Lifecycle

- Purchase: wallet debit, `group` ledger row, group, owner membership and group home in one transaction.
- Settings and badge are changed by the owner; members are accepted, promoted, demoted or removed by admins.
- Deleting the group, or its owner habbo, deletes its memberships and home.

# Vocabularies

| Column | Values |
|--------|--------|
| `groups.access` | `open`, `moderated`, `closed` |
| `group_members.role` | `member`, `admin` |
| `groups.badge` | badge code: `b` + base (2-digit shape, 2-digit colour), then up to four `s` + symbol parts (2-digit template, 2-digit colour, 1-digit position 0–8), e.g. `b0503Xs09114s05013s05015` |

# Relations

- Owned by a [habbo](/entities/habbo.md); has a [home](/entities/home.md); paid from a
  [wallet](/entities/wallet.md).

# Tables

- [groups](/tables/groups.md)
- [group_members](/tables/group_members.md)
