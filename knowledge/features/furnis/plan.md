---
type: Plan
title: "Furnis, with the catalogue: how"
description: Housekeeping edits the catalogue and furni, and the game brings the furni S5 left out.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/housekeeping` | A catalogue editor ([later](/features/furnis/later.md), "A catalogue editor in housekeeping"); a habbo's furni seen and changed by staff |
| `packages/server` | Reloads the catalogue when it changes; one-way doors and the fortune teller; limits for post-its and rollers, with the client's alerts 403 and 404 ([later](/features/furnis/later.md)) |
| `packages/store`, `packages/virtual` | What those need |
| `packages/installer` | Shares the catalogue's lists and edits with the editor, if [the installer](/features/installer/spec.md) gets its review step |
| `packages/cms` | Already holds the shared inventory, `/account/furni` |

The catalogue's pages that S5 left out, Pets, Camera, the Trax pages and the Club Shop, come back with the features that
sell them, in [extras](/features/extras/spec.md)
([server 0101](/decisions/server/0101-the-pages-of-s7s-furni-wait-for-s7.md)).

# Decisions

The user's decisions are written here when the feature is planned.
