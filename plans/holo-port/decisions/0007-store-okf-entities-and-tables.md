---
type: Decision
title: Store knowledge documents entities and tables
description: The store's OKF bundle adds entities/ and tables/ concepts next to the required schemas/ and queries/ concepts.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [store, okf]
---

# Decision

- `packages/store/knowledge/schemas/<feature>.md` (`SQL Schema File`) and `queries/<feature>.md` (`SQL Query`) stay,
  as `make check-docs` requires.
- `tables/<table>.md` (`SQLite Table`, `resource` = the schema file that declares it) holds the column table.
- `entities/<entity>.md` (`Entity`) holds the meaning, invariants, lifecycle, allowed values of open vocabularies
  and links to tables and queries.
- `.agents/skills/documenting-with-okf/SKILL.md` describes the new folders.

# Context

The user asked for OKF files "based on entities".
