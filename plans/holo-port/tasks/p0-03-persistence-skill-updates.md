---
type: Task
title: Update the persistence and OKF skills
description: Align adding-data-persistence and documenting-with-okf with the store API, native types and entity and table concepts.
status: todo
phase: p0
depends_on: [p0-02]
packages: [.agents/skills/adding-data-persistence, .agents/skills/documenting-with-okf]
holo: []
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
---

# Goal

The skills describe what the code does after [0007](/decisions/0007-store-okf-entities-and-tables.md),
[0011](/decisions/0011-store-returns-sql-db.md) and [0012](/decisions/0012-sqlite-native-types.md).

# Steps

- [ ] `adding-data-persistence`, schema rules:
  - `DATETIME` for instants, written from Go as UTC;
  - `DATE` for calendar dates;
  - `BOOLEAN` with `TRUE`/`FALSE`;
  - no `TIME` columns and no `CURRENT_TIMESTAMP`;
  - a foreign-key parent table must exist before rows are written to the child table.
- [ ] `adding-data-persistence`, step 6: consume with `store.Open`/`store.Must` + `store.New(db)`; multi-step
      writes with `db.BeginTx` + `q.WithTx(tx)`; the single-connection transaction gotcha. Update the checklist.
- [ ] `documenting-with-okf`: bundle layout and concept-type table gain `entities/` (`Entity`) and `tables/`
      (`SQLite Table`); conformance checklist updated.
- [ ] Review both skills with the `reviewing-skills` skill.

# Verification

```sh
grep -rn "Begin\|\*Store\|unix seconds\|0/1" .agents/skills/adding-data-persistence .agents/skills/documenting-with-okf
```

Expected: no matches that describe the old API or the old type rules.

# Notes
