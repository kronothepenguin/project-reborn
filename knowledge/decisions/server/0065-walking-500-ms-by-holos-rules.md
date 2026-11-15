---
type: Decision
title: Habbos walk a step every 500 ms, by Holo's rules
description: The server moves a walking habbo one tile every 500 ms, the client's own step time, in 8 directions, a diagonal only when both tiles beside it are free, and up or down at most 1 height.
status: accepted
timestamp: 2026-11-10T16:41:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:41:02+00:00"}
tags: [server, rooms, walking]
---

# Decision

- A walking habbo moves one tile every 500 ms, the time the client's Human class takes to animate a step
  (`pMoveTime`).
- It moves in 8 directions; a diagonal only when both tiles beside it are free, so nobody cuts a corner, as Holo's
  pathfinder had it.
- A step goes up or down at most 1 height.

# Context

Holo stepped every 410 ms with A* paths. Offered the client's 500 ms with Holo's rules, or Holo's 410 ms, the user chose
"500 ms, Holo's rules (Recommended)": "One step every 500 ms, the client's own step time; 8 directions, a diagonal only
when both tiles beside it are free, so nobody cuts corners; a step up or down of at most 1 height, as Holo's pathfinder
allowed. Example: crossing 4 tiles takes 2 s."

# Consequences

- s4-04 applies it.
