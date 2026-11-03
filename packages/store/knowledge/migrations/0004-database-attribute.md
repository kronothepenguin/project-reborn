---
type: SQL Update
title: 0004-database-attribute.sql
description: Grants housekeeping.database to every group and every user that holds housekeeping.accessGroups.
resource: packages/store/migrations/0004-database-attribute.sql
tags: [store, update, access]
timestamp: 2026-11-03T22:14:59+00:00
---

# Update

| | |
|---|---|
| Title | Applying database updates and config.json changes, for every group and user that manages access. |
| Automatic | no |

Adds `housekeeping.database` to the rows of [access_group_attributes](/tables/access_group_attributes.md) and
[user_attributes](/tables/user_attributes.md) of those holding `housekeeping.accessGroups`, keeping the rows already
there. A new hotel's Administrator gets it after [0003-ranks.sql](/migrations/0003-ranks.md), and an existing hotel's
administrators get it with their first updates, which they may apply because they manage access.
