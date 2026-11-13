---
type: Slice
title: Badges and achievements
description: The site shows a habbo's five worn badges, and habbos earn achievements.
status: planned
projects: [store, server, cms, housekeeping]
depends_on: []
from: ["plans/later.md"]
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [badges, achievements]
---

# Goal

The five badge slots of the client show on the site, and achievements exist (`plans/later.md`, "Five badges on the site"
and "Achievements").

# Scope

| Project | Part |
| --- | --- |
| `packages/cms` | A habbo's five worn badges on its profile and home, where one shows today |
| `packages/server`, `packages/store` | Achievements: what earns one, what is saved |
| `packages/housekeeping` | The badge tool, with the slots |

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

- Which achievements the hotel has and what earns each; the client's cast for them is not among the casts the server
  reads (`plans/server/decisions/0051-no-achievements-yet.md`).
