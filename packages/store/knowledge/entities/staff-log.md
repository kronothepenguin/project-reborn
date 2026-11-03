---
type: Entity
title: Staff log
description: The audit trail of every staff action, with the acting user, the target user or habbo, and the IP.
tags: [store, entity, moderation]
timestamp: 2026-11-03T22:26:11+00:00
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
| `habbos.restore` | none | the user and the habbo |
| `users.update` | the fields saved, never their values | the user and the habbo of the page |
| `credits.give` | the signed amount | the user and the habbo |
| `alerts.send` | none | the user and the habbo |
| `alerts.broadcast` | how many habbos got it | none |
| `help.pick` | the ticket's id | the user and the habbo who asked, when they still exist |
| `help.close` | the ticket's id | the user and the habbo who asked, when they still exist |
| `bans.create` | the reason, the end of the ban and the address, if any | the user and the habbo named |
| `bans.lift` | the ban's id and reason | the user |
| `badges.give` | the badge | the user and the habbo |
| `badges.wear` | the badge, which the habbo already had | the user and the habbo |
| `badges.delete` | the badge | the user and the habbo |
| `users.attributes` | the attributes added and removed | the user and the habbo of the page |
| `users.refused` | what was tried on a user at or above the actor's level | the user and the habbo |
| `homeStore.create` | the item's name and price, as Holo logged it: `<name> worth <price> credits` | none |
| `homeStore.update` | the item's name and id, and the fields that changed, never their values | none |
| `database.update` | each update applied, the one that failed with its error, and the path of the copy saved first | none |
| `config.update` | the keys added to config.json and the keys removed from it, never their values | none |

# Relations

- Acting [user](/entities/user.md); target [user](/entities/user.md) or [habbo](/entities/habbo.md).

# Tables

- [staff_logs](/tables/staff_logs.md)

# Queries

- [staff-logs.query.sql](/queries/staff-logs.md)
