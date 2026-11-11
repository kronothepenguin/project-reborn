---
type: Task
title: Add the furni definitions and the catalogue to the store
description: The store gets the furni definitions, the catalogue's pages and its items, and an update that seeds Holo's catalogue of 76 pages, 1,372 furni and 19 deals.
status: todo
phase: s5
depends_on: []
packages: [packages/store]
client: []
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

The hotel knows what each furni is and what its catalogue sells
([0091](/decisions/0091-holos-catalogue-changed-by-updates.md),
[0097](/decisions/0097-furni-definitions-and-catalogue-items-apart.md)).

# Steps

- [ ] Tables for the furni definitions, each with its sprite, colours, kind, size, height and whether it is a door,
  tradeable and recyclable; for the catalogue's pages, each with its layout, images, texts and the access group level a
  habbo needs to see it; and for the catalogue's items, each with its page, its place on it, its name, description and
  price, and the furni it gives, several for a deal
  ([0097](/decisions/0097-furni-definitions-and-catalogue-items-apart.md)).
- [ ] An update with the tables that seeds Holo's catalogue from `source/holoemu/Resources/holodb.sql`: its 76 pages,
  its 1,372 rows split into definitions and catalogue items, and its 19 deals
  ([0091](/decisions/0091-holos-catalogue-changed-by-updates.md)).
- [ ] The named queries that load them, tests, and the OKF concepts, with the `adding-data-persistence` skill.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
make gates
```

# Notes

- Runs on the branch `s5-catalogue-tables`.
- To settle before it starts:
  - Whether the page names that Holo's English dump keeps in Dutch, Trofeen, Kerst, Pasen, Ramen and Draken, are written
    in English.
  - Whether a page keeps Holo's minimum rank as the access group level a habbo needs, as the categories did
    ([0055](/decisions/0055-holos-navigator-set.md)).
  - Whether Holo's rows that repeat a furni, such as the Mummy poster on two pages, become one definition.
  - What the kinds of furni are called; Holo numbered them 0 to 4.
