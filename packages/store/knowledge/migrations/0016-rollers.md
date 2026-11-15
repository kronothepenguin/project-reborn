---
type: SQL Update
title: 0016-rollers.sql
description: Rebuilds furni_definitions with the kind roller, and gives it to the ten rollers of Holo's catalogue.
resource: packages/store/migrations/0016-rollers.sql
tags: [store, update, catalogue]
timestamp: 2026-11-11T17:51:13+00:00
---

# Update

| | |
|---|---|
| Title | Rollers are a kind of furni of their own, which habbos walk onto and which carries what stands on it. |
| Automatic | no |

Rebuilds [furni_definitions](/tables/furni_definitions.md), whose `kind` now also takes `roller`: a new table with every
row copied, the old one dropped, the new one renamed, and its index made again. The ten rollers of Holo's catalogue, the
definitions 465 to 474, were solids there and become rollers
(`knowledge/decisions/server/0107-rollers-roll-every-two-seconds.md`).
