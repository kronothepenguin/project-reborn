---
type: Decision
title: Access groups are Holo's ranks
description: The installer creates Holo's staff ranks as access groups with attributes, and admins can create, edit and delete any group.
status: accepted
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [access, installer]
---

# Decision

- The installer creates Holo's staff ranks as access groups. They are examples, and the admin can change or delete them.

| Group | Level | Attributes | Listed on `/staff` |
| --- | --- | --- | --- |
| Administrator | 7 | All | Yes |
| Moderator | 6 | `housekeeping.access`, `.users`, `.credits`, `.vouchers`, `.bans`, `.alerts`, `.alertsBroadcast`, `.help`, `.banners`, `.homeStore`, `forum.edit`, `homes.staffItems`, `site.maintenanceBypass` | Yes |
| Gold Hobba | 5 | None | Yes |
| Silver Hobba | 4 | None | Yes |
| HabboX | 3 | None | Yes |

- Holo's rank 1 is a normal user and rank 2 is Habbo Club, so neither becomes a group.
- The first administrator joins Administrator.
- Access groups can be deleted, unless that breaks the guard of
  [0053](/decisions/0053-attributes-on-groups-and-users.md).

# Context

Replaces the single "Administrators" group of [0014](/decisions/0014-attribute-based-access.md). The names come from
Holo's `staff.php`, and the Moderator's list from the pages `housekeeping/index.php` keeps for rank 7.
`housekeeping.usersPrivate` stays out of it, as the user's example of
[0053](/decisions/0053-attributes-on-groups-and-users.md) needs. The user answered: "they are custom groups that allows
easy management of users access, so they are deletable, we include some of them as examples but are fully customizable
by the admin." and "here add the same ranks holo has, but they are groups with attributes in reborn", then confirmed
this table.

# Consequences

- Moderators can create credits and vouchers, as in Holo, until an admin unticks it.
