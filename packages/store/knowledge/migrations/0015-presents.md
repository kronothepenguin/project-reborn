---
type: SQL Update
title: 0015-presents.sql
description: Lets a furni wait inside a present by adding to furni the box that holds it.
resource: packages/store/migrations/0015-presents.sql
tags: [store, update, furni]
timestamp: 2026-11-11T17:28:49+00:00
---

# Update

| | |
|---|---|
| Title | A furni may wait inside a present, the box that holds it. |
| Automatic | no |

Adds `box_furni_id` to [furni](/tables/furni.md), with its index
(`plans/server/decisions/0094-any-habbo-sends-a-present-to-any-habbo.md`). No row changes: nothing waits in a box yet.
