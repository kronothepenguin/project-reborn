---
type: Task
title: Update the persistence and OKF skills
description: Align adding-data-persistence and documenting-with-okf with the store API, native types and entity and table concepts.
status: done
phase: p0
depends_on: [p0-02]
packages: [.agents/skills/adding-data-persistence, .agents/skills/documenting-with-okf]
holo: []
timestamp: 2026-10-27T21:11:10+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-27T21:11:10+00:00"}
---

# Goal

The skills describe what the code does after [0007](/decisions/0007-store-okf-entities-and-tables.md),
[0011](/decisions/0011-store-returns-sql-db.md) and [0012](/decisions/0012-sqlite-native-types.md).

# Steps

- [x] `adding-data-persistence`, schema rules:
  - `DATETIME` for instants, written from Go as UTC;
  - `DATE` for calendar dates;
  - `BOOLEAN` with `TRUE`/`FALSE`;
  - no `TIME` columns and no `CURRENT_TIMESTAMP`;
  - a foreign-key parent table must exist before rows are written to the child table.
- [x] `adding-data-persistence`, step 6: consume with `store.Open`/`store.Must` + `store.New(db)`; multi-step
      writes with `db.BeginTx` + `q.WithTx(tx)`; the single-connection transaction gotcha. Update the checklist.
- [x] `documenting-with-okf`: bundle layout and concept-type table gain `entities/` (`Entity`) and `tables/`
      (`SQLite Table`); conformance checklist updated.
- [x] Review both skills with the `reviewing-skills` skill.

# Verification

```sh
grep -rn "Begin\|\*Store\|unix seconds\|0/1" .agents/skills/adding-data-persistence .agents/skills/documenting-with-okf
python3 .agents/skills/reviewing-skills/scripts/validate_skill.py --strict .agents/skills/adding-data-persistence
python3 .agents/skills/reviewing-skills/scripts/validate_skill.py --strict .agents/skills/documenting-with-okf
```

Expected: no matches that describe the old API or the old type rules.

Results (2026-10-27T21:11:10+00:00):

- The grep's only match is `tx, err := db.BeginTx(ctx, nil)` in the new transaction example of
  `adding-data-persistence`: the new API, as intended.
- The validator reports `0 error(s), 0 warning(s)` for both skills in strict mode.
- Review against the structure, content and process checklists found two problems, both fixed:
  - Step 7 of `adding-data-persistence` asked for a clean `git diff --exit-code`, which fails whenever there are
    uncommitted edits (hit in [p0-02](/tasks/p0-02-store-open-returns-db.md)). It now limits the diff to the
    generated files.
  - `documenting-with-okf` did not say what `make check-docs` leaves unchecked. It now says the indexes and the
    table and entity concepts are checked by hand.
- Outside `specs/` (ignored by the user's rules) and this bundle's history, no Markdown file still describes
  `*store.Store`, `Begin`, unix-second integers or 0/1 booleans.

# Notes

- Added beyond the listed steps, on purpose: the table of schema rules in `adding-data-persistence` also carries
  the database rules approved in the plan (role-prefixed foreign keys, `ON DELETE CASCADE` / `SET NULL`, `CHECK`
  only for closed sets, raw text), so [p0-04](/tasks/p0-04-identity-schema.md) and
  [p0-05](/tasks/p0-05-world-schema.md) follow one source.
- `documenting-with-okf` now calls `/…` links "bundle-absolute", the OKF term, and asks for explicit offsets in
  `timestamp`.
- The process checklist's evaluation items (scenarios, baselines, model coverage) do not apply: the repository has
  no skill evaluations.
- `specs/013-store-library` records `(*Store).Begin` and a `packages/store/tx.go` as implemented; neither existed.
  `specs/` is left untouched.
- The `tracking-holo-port` skill from [p0-01](/tasks/p0-01-port-state-bundle.md) also passes the strict validator.
