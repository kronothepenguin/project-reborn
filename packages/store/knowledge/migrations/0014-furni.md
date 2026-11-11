---
type: SQL Update
title: 0014-furni.sql
description: Creates furni, the pieces of furni habbos own, each in a hand, in a room or in its user's shared inventory.
resource: packages/store/migrations/0014-furni.sql
tags: [store, update, furni]
timestamp: 2026-11-11T16:24:23+00:00
---

# Update

| | |
|---|---|
| Title | The furni habbos own, each piece in a hand, in a room or in its user's shared inventory. |
| Automatic | no |

Creates [furni](/tables/furni.md) with its three indexes (`plans/holo-port/decisions/0057-furni-and-rooms.md`,
`plans/server/decisions/0096-the-hand-is-read-from-the-database.md`). It seeds nothing: a hotel starts with no furni.
