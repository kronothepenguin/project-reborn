---
type: Slice
title: Furnis, with the catalogue
description: Housekeeping edits the catalogue and a habbo's furni, and the furni left out of S5 arrives: one-way doors, the fortune teller, limits for post-its and rollers, and the pages that wait for their features.
status: planned
projects: [store, virtual, server, housekeeping, cms, installer]
depends_on: [platform]
from: ["plans/later.md", "plans/server/phases/s7-club-help-extras.md"]
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [furni, catalogue]
---

# Goal

Furni is managed from every side.

The user: "furnis kind of the same, housekeeping allow to modify them, cms manages own furnis and server show and
controls states..."

# Scope

| Project | Part |
| --- | --- |
| `packages/housekeeping` | A catalogue editor (`plans/later.md`, "A catalogue editor in housekeeping"); a habbo's furni seen and changed by staff |
| `packages/server` | Reloads the catalogue when it changes; one-way doors and the fortune teller; limits for post-its and rollers, with the client's alerts 403 and 404 (`plans/later.md`) |
| `packages/store`, `packages/virtual` | What those need |
| `packages/installer` | Shares the catalogue's lists and edits with the editor, if [the installer](/slices/installer.md) gets its review step |
| `packages/cms` | Already holds the shared inventory, `/account/furni` |

The catalogue's pages that S5 left out, Pets, Camera, the Trax pages and the Club Shop, come back with the features that
sell them, in [extras](/slices/extras.md) (`plans/server/decisions/0101-the-pages-of-s7s-furni-wait-for-s7.md`).

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

- The design of the catalogue editor, which `plans/server/decisions/0091-holos-catalogue-changed-by-updates.md` left to
  be asked: what it edits, and how it lives with updates that change the catalogue later.
- What staff may do with a habbo's furni in housekeeping: see it, give it, take it, move it.
- Whether a room limits its post-its and its rollers, and at what numbers.
- One-way doors need their furni in the catalogue, which Holo's does not sell, and the fortune teller its states: where
  each comes from.
