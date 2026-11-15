---
type: Decision
title: Group names take 25 characters and descriptions 200
description: A group's name takes 1 to 25 characters and its description up to 200 on purchase and in the settings, whose counter starts at 200, and a name another group has is refused.
status: accepted
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
tags: [groups, p5]
---

# Decision

- A group's name takes 1 to 25 characters and its description up to 200, on purchase and in the settings, counted on
  what is typed.
- The settings counter starts at 200, not at Holo's 255.
- A name another group has is refused, on purchase and on rename, with "A group with this name already exists."
- The settings can still empty the description, as in Holo.

# Context

Holo's purchase never checked the lengths, its settings counter started at 255, and a rename could take a used name,
which the schema refuses. The user chose 25 and 200 everywhere.
