---
type: Decision
title: The online habbos live in virtual/habbo
description: The habbos online in the game are package-level state in packages/virtual/habbo, package habbo, loaded at login and dropped at logout.
status: accepted
timestamp: 2026-11-10T02:09:39+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:09:39+00:00"}
tags: [server, virtual, layout]
---

# Decision

- The habbos online in the game live in `packages/virtual/habbo`, package `habbo`: package-level state, as
  `virtual/settings` is, loaded at login and dropped at logout ([0009](/decisions/server/0009-virtual-holds-the-server-state.md)).

# Context

[0005](/decisions/server/0005-package-layout.md) drew the layout with `virtual/habbos/` and left the names of `virtual`'s
packages to the phase that needs each one. Offered `virtual/habbos`, as the layout drew it, or `virtual/habbo`, the user
chose "virtual/habbo": "Singular, Go's usual package naming. Example: habbo.Get(avatarID), habbo.Online()."

# Consequences

- s2-05 creates it.
- The other packages of 0005's layout, such as `rooms/` and `furni/`, are still named by the phases that need them.
