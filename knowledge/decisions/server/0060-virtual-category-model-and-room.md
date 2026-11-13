---
type: Decision
title: The navigator's shared data lives in virtual/category, virtual/model and virtual/room
description: virtual/category holds the categories, virtual/model the room models, and virtual/room the public rooms and, from S4, the loaded rooms and who is in them.
status: accepted
timestamp: 2026-11-10T03:39:13+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:39:13+00:00"}
tags: [server, virtual, layout]
---

# Decision

- `packages/virtual/category` holds the navigator's categories, `packages/virtual/model` the room models, and
  `packages/virtual/room` the public rooms; [S4](/phases/s4-rooms.md) adds the loaded rooms and who is in them to
  `virtual/room`.
- The three load when the server starts and stay, as shared data does
  ([0009](/decisions/0009-virtual-holds-the-server-state.md)).

# Context

[0005](/decisions/0005-package-layout.md) leaves the names of `virtual`'s packages to the phase that needs each one.
Offered one package per entity, or one navigator package for the three, the user chose "category, model, room
(Recommended)": "virtual/category for the categories, virtual/model for the room models, and virtual/room for the
public rooms now and, with S4, the loaded rooms and who is in them. Example: room.Public(id), model.Get("newbie_lobby")."

# Consequences

- [s3-02](/tasks/s3-02-navigator-state.md) creates them.
