---
type: SQL Update
title: 0017-room-decorations.sql
description: Adds to rooms the wallpaper, the floor and the landscape a habbo's room was decorated with.
resource: packages/store/migrations/0017-room-decorations.sql
tags: [store, update, navigator]
timestamp: 2026-11-11T17:57:37+00:00
---

# Update

| | |
|---|---|
| Title | A habbo's room keeps the wallpaper, the floor and the landscape it was decorated with. |
| Automatic | no |

Adds `wallpaper`, `floor` and `landscape` to [rooms](/tables/rooms.md), each empty: every room shows its model's own
until it is decorated.
