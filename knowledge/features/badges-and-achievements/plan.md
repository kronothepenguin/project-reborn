---
type: Plan
title: "Badges and achievements: how"
description: Housekeeping gives badges and the game sets the five slots; the site shows five worn badges, and the game and the store bring achievements.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/store` | `avatar_badges`: a habbo's badges, each with its slot, 1 to 5, or 0 when it is not worn |
| `packages/housekeeping` | The badge tool: `POST /housekeeping/habbos/{id}/badges` and `.../badges/{code}/delete` |
| `packages/server` | Loads the badges at login, `SETBADGE` sets the five slots, 228 and 229 send them; 436 lists no achievement |
| `packages/cms` | Shows the badge of the first slot a habbo fills |

Planned:

| Project | Part |
| --- | --- |
| `packages/cms` | A habbo's five worn badges on its profile and home, where one shows today |
| `packages/server`, `packages/store` | Achievements: what earns one, what is saved |
| `packages/housekeeping` | The badge tool, with the slots |

# Decisions

- [A habbo has no achievements yet](/decisions/server/0051-no-achievements-yet.md) — 436 lists no achievements and the
  server sends no 437, so `GETSELECTEDBADGES` waits for achievements.
- [The online habbo holds its badges, its sound setting and its
  fuses](/decisions/server/0053-the-online-habbo-holds-its-own-data.md) — `game.Login` loads the habbo's badges and the
  ones it wears.
- [A habbo wears up to five badges, in slots](/decisions/server/0083-a-habbo-wears-five-badges-in-slots.md) — The store
  keeps a slot, 1 to 5, for each worn badge, as the client's badge window sets them.
