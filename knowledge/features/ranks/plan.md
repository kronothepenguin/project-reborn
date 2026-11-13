---
type: Plan
title: "Ranks: how"
description: Auth reads attributes, levels and fuses, the store holds the groups and seeds Holo's ranks, and housekeeping edits them behind its staff guard and logs every change.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/auth` | The attribute catalogue, the fuse catalogue, `Attributes`, `Level`, `Outranks` and `Fuses`; `ActiveBan` passes holders of `housekeeping.access` on a banned address |
| `packages/store` | The tables of access groups, members, group attributes, direct attributes and the staff log; the update `0003-ranks.sql` seeds Holo's ranks and `0009-holo-fuses.sql` gives them their fuses |
| `packages/installer` | Puts the first administrator in Administrator |
| `packages/housekeeping` | The staff guard (`router.Staff`), `/access-groups`, the direct attributes on a user's page, the guard `keepManager`, `writeLog` and `/logs` (`packages/housekeeping/knowledge/index.md`) |
| `packages/server` | Gives a habbo the fuses of its user's groups in the game |

# Decisions

- [Housekeeping under /housekeeping](/decisions/holo-port/0003-housekeeping-under-prefix.md) — Every housekeeping route
  lives under `/housekeeping/` and uses the site's session, with no login of its own.
- [Attributes on groups and on users](/decisions/holo-port/0053-attributes-on-groups-and-users.md) — A user holds their
  groups' attributes and direct ones, `housekeeping.usersPrivate` covers emails and IP history, and one user must keep
  both `housekeeping.access` and `housekeeping.accessGroups`.
- [Access groups are Holo's ranks](/decisions/holo-port/0054-access-groups-are-holos-ranks.md) — A new hotel starts
  with Holo's five staff ranks as editable, deletable groups, and the first administrator joins Administrator.
- [Staff levels](/decisions/holo-port/0055-staff-levels.md) — Each group has a level, staff act only on users below
  them, IP bans pass housekeeping staff, and a banned user in housekeeping goes to the site.
- [What housekeeping can delete](/decisions/holo-port/0063-what-housekeeping-can-delete.md) — The staff log is never
  changed or deleted.
- [The first fuses follow Holo's ranks by level](/decisions/server/0046-the-first-fuses-follow-holos-ranks.md) — An
  update gives each group the fuses Holo's ranks held up to its level, and level 7 the fuses Holo never ranked.

# Notes

- A change of membership reads the group's level, and the member's level stays out of it, so an administrator can take
  another administrator out of a group.
- The confirmation of a group's delete is a box the server checks, so it works without JavaScript.
