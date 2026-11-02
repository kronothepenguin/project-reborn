---
type: Entity
title: Staff log
description: The audit trail of every staff action, with the acting user, the target user or habbo, and the IP.
tags: [store, entity, moderation]
timestamp: 2026-11-02T02:14:12+00:00
---

# Definition

Every housekeeping mutation writes one staff log row through a single helper, so the log is complete (Holo skipped
many actions).

# Invariants

- Rows are never updated or deleted by the application.
- Actor and targets become NULL when those accounts are deleted; the row stays.

# Lifecycle

- Written in the same transaction as the action it records, except that `settings.Set` cannot join a transaction, so
  the row of a settings change is written just before it. A failed write leaves a row for a change that did not happen,
  never a change without a row.
- Read in housekeeping with `housekeeping.logs`.

# Vocabularies

| Column | Values |
|--------|--------|
| `action` | dotted names of the form `<area>.<verb>`; the table below lists those in use |

| Action | Detail | Target |
|--------|--------|--------|
| `settings.update` | the keys that changed, never their values | none |
| `note.update` | none | none |
| `accessGroups.create` | the group | none |
| `accessGroups.update` | the group, and the attributes added and removed | none |
| `accessGroups.delete` | the group | none |
| `accessGroups.addMember` | the group | the user and the display habbo |
| `accessGroups.setDisplayHabbo` | the group | the user and the display habbo |
| `accessGroups.removeMember` | the group | the user |
| `accessGroups.refused` | what was refused, as Holo logged the refusals of its rank tool | the user, when there is one |
| `habbos.update` | the fields saved, never their values | the user and the habbo |
| `users.update` | the fields saved, never their values | the user and the habbo of the page |
| `credits.give` | the signed amount | the user and the habbo |
| `badges.give` | the badge | the user and the habbo |
| `badges.wear` | the badge, which the habbo already had | the user and the habbo |
| `badges.delete` | the badge | the user and the habbo |
| `users.refused` | what was tried on a user at or above the actor's level | the user and the habbo |

# Relations

- Acting [user](/entities/user.md); target [user](/entities/user.md) or [habbo](/entities/habbo.md).

# Tables

- [staff_logs](/tables/staff_logs.md)

# Queries

- [staff-logs.query.sql](/queries/staff-logs.md)
