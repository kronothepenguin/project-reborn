---
type: SQL Update
title: 0012-badge-slots.sql
description: Rebuilds avatar_badges with a slot 1 to 5 for each worn badge in place of worn, the badge a habbo wore taking slot 1.
resource: packages/store/migrations/0012-badge-slots.sql
tags: [store, update, habbo]
timestamp: 2026-11-10T20:23:05+00:00
---

# Update

| | |
|---|---|
| Title | Badges worn in five slots, as the R26 client's badge window sets them: the badge a habbo wore takes slot 1. |
| Automatic | no |

Makes [avatar_badges](/tables/avatar_badges.md) again with `slot`, 0 to 5, in place of `worn`, copies the rows with a
worn badge in slot 1, and creates `idx_avatar_badges_avatar_id_slot`
(`knowledge/decisions/server/0083-a-habbo-wears-five-badges-in-slots.md`).
