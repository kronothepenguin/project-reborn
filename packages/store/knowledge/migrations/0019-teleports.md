---
type: SQL Update
title: 0019-teleports.sql
description: Adds to furni the other teleport of a teleport's pair.
resource: packages/store/migrations/0019-teleports.sql
tags: [store, update, furni]
timestamp: 2026-11-11T18:14:38+00:00
---

# Update

| | |
|---|---|
| Title | A teleport knows the other teleport of its pair. |
| Automatic | no |

Adds `partner_furni_id` to [furni](/tables/furni.md), empty for every furni there is, with the index
`idx_furni_partner_furni_id` (`plans/server/decisions/0111-a-teleport-keeps-its-partner.md`).
