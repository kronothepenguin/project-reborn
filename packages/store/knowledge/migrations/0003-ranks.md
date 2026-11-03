---
type: SQL Update
title: 0003-ranks.sql
description: Creates Holo's five staff ranks as access groups with their attributes, only on a hotel that has no access group yet.
resource: packages/store/migrations/0003-ranks.sql
tags: [store, update, access]
timestamp: 2026-11-03T21:54:04+00:00
---

# Update

| | |
|---|---|
| Title | Holo's staff ranks as access groups, for a hotel that has no access group yet. |
| Automatic | no |

Writes [access_groups](/tables/access_groups.md) 1 to 5, all listed on the staff page: Administrator (level 7, the 19
attributes of the catalogue when the ranks became an update), Moderator (6, 13 attributes), Gold Hobba (5), Silver Hobba
(4) and HabboX (3), and their rows of [access_group_attributes](/tables/access_group_attributes.md).

A temporary table decides once, before any row is written, whether the hotel has no group; a hotel with groups keeps them
as they are, without new attributes.
