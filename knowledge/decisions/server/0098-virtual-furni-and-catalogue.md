---
type: Decision
title: S5's shared data lives in virtual/furni and virtual/catalogue
description: virtual/furni holds the furni definitions and virtual/catalogue the pages and what they sell, both loaded at start; a room's placed furni and an open trade live in the loaded room of virtual/room.
status: accepted
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
tags: [server, virtual, packages]
---

# Decision

- `packages/virtual/furni` holds the furni definitions, which rooms, hands, trades and the recycler read.
- `packages/virtual/catalogue` holds the catalogue's pages and what they sell, and reads `virtual/furni`.
- Both load when the server starts and stay, as shared data does
  ([0009](/decisions/server/0009-virtual-holds-the-server-state.md)).
- A room's placed furni lives in the loaded room, `packages/virtual/room`
  ([0009](/decisions/server/0009-virtual-holds-the-server-state.md)), and so does an open trade, which ends when either habbo
  leaves the room ([0092](/decisions/server/0092-a-trade-lives-only-in-memory.md)).

# Context

[0005](/decisions/server/0005-package-layout.md) leaves the names of `virtual`'s packages to the phase that needs each one, and
[0060](/decisions/server/0060-virtual-category-model-and-room.md) named the navigator's. Offered furni and catalogue, or one
catalogue package for both, the user chose "furni and catalogue (Recommended)": "virtual/furni holds the furni
definitions, which rooms, hands, trades and the recycler all read; virtual/catalogue holds the pages and what they sell,
and reads virtual/furni. Example: furni.Get(id), catalogue.Page("Rare")." The question itself placed the placed furni
and an open trade in the loaded room.

# Consequences

- s5-02 creates the two packages.
