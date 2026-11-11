---
type: Decision
title: The catalogue's page names are English
description: The six page names that Holo's English dump keeps in Dutch or misspells are seeded as Trophies, Christmas, Easter, Windows, Dragons and Trophies Rare; every other name, description and price stays Holo's.
status: accepted
timestamp: 2026-11-11T15:38:49+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:38:49+00:00"}
tags: [server, catalogue, data]
---

# Decision

- The seed names six pages in English: Trophies for Trofeen, Christmas for Kerst, Easter for Pasen, Windows for Ramen,
  Dragons for Draken and Trophies Rare for Tropies Rare. They are the names those pages carry as their codes in Holo's
  own rows.
- Every other name, description and price stays exactly as Holo's.

# Context

[0091](/decisions/0091-holos-catalogue-changed-by-updates.md) seeds the dump whose names are English, which still names
these six pages in Dutch or with a typo. Offered English names or exactly Holo's rows, the user chose "English names
(Recommended)": "Trophies, Christmas, Easter, Windows, Dragons and Trophies Rare, the names those pages already carry
inside Holo's own rows; every other name, description and price stays exactly as Holo's. As S3 seeded the categories in
English."

# Consequences

- [s5-01](/tasks/s5-01-catalogue-tables.md) seeds them.
- Holo's other oddities stay as they are: 28 furni named `NAME`, one with no name, and three page texts with a `?` where
  an apostrophe was.
