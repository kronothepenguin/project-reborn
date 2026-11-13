---
type: Plan
title: "Badges and achievements: how"
description: The site shows five worn badges, and the game and the store bring achievements.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/cms` | A habbo's five worn badges on its profile and home, where one shows today |
| `packages/server`, `packages/store` | Achievements: what earns one, what is saved |
| `packages/housekeeping` | The badge tool, with the slots |

# Decisions

The user's decisions are written here when the feature is planned.
