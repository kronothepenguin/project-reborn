---
type: Decision
title: Go package names drop the dash
description: The backend and fullstack templates of tools/create name the Go package after the project without its dashes, so game-server holds package gameserver, while folders and module paths keep the dash.
status: accepted
timestamp: 2026-11-07T00:12:36+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:12:36+00:00"}
tags: [tools, packages]
---

# Decision

- The backend and fullstack templates of `tools/create` name the Go package after the project without its dashes:
  `game-server` gives `package gameserver`.
- Folders and module paths keep the dash: `packages/game-server`, `apps/game-server` and
  `github.com/kronothepenguin/project-reborn/packages/game-server`.

# Context

`validateName` accepts a name such as `a-b`, and the templates wrote `package a-b`, which does not compile
(s0-09). The user chose "Drop the dash (Recommended)": "`packages/game-server`
holds `package gameserver`. That is Go's own convention: lowercase, no underscores."

# Consequences

- s0-09 makes the templates follow it.
