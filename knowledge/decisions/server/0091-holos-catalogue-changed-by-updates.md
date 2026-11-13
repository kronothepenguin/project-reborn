---
type: Decision
title: A hotel starts with Holo's catalogue, changed by database updates
description: An update seeds Holo's English catalogue, 76 pages, 1,372 furni and 19 deals; no page edits it in S5, a change is another update, and a housekeeping editor waits in the furnis feature's later notes.
status: accepted
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
tags: [server, catalogue, data]
---

# Decision

- An update of the store seeds the hotel's catalogue from `source/holoemu/Resources/holodb.sql`, the dump whose names
  are English, as [0055](/decisions/server/0055-holos-navigator-set.md) did for the navigator: its 76 pages, its 1,372 furni
  with their names, descriptions, prices, sprites, colours, sizes and flags, and its 19 deals.
- No page edits the catalogue in S5. A new price, a new furni or a new page is another database update.
- A catalogue editor in housekeeping waits in `knowledge/features/furnis/later.md`.

# Context

The repository has no catalogue and no furni, and the client keeps neither: it asks the server for every page. Offered
Holo's catalogue changed by updates, the same with a housekeeping editor, or files in the repository, the user chose
"Holo's, changed by updates (Recommended)": "A database update copies Holo's English catalogue
(source/holoemu/Resources/holodb.sql), as S3 did for the categories and public rooms. No page edits it in S5: a new
price or page is another database update. Example: a Throne costs 25 credits because Holo's row says 25. A housekeeping
editor is noted in plans/later.md."

The other dump, `source/holoemu/holodb.sql`, names 20 of the pages in Dutch, Badkamer for Bathroom, and has 21 furni
rows that the English dump lacks or holds differently, among them those of a page 81.

# Consequences

- s5-01 writes the update.
- `knowledge/features/furnis/later.md` gains "A catalogue editor in housekeeping".
