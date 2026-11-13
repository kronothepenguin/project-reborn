---
type: Playbook
title: Store bundle
description: The layout, concept types, naming and body rules of this bundle, and what make check-docs checks.
---

# Layout

```text
packages/store/knowledge/
├── index.md            # root listing; declares okf_version: "0.2"
├── store.md            # the Go package (type: Go Package)
├── bundle.md           # this playbook
├── schemas/
│   ├── index.md
│   └── <feature>.md    # one concept per schema file
├── tables/
│   ├── index.md
│   └── <table>.md      # one concept per declared table
├── entities/
│   ├── index.md
│   └── <entity>.md     # one concept per domain entity
├── queries/
│   ├── index.md
│   └── <feature>.md    # one concept per query file
├── migrations/
│   ├── index.md
│   └── NNNN-<slug>.md  # one concept per update file
└── discussions/
    ├── index.md
    └── <slug>.md       # one question kept for a later discussion
```

# Concept types

| Source artifact | `type` | Concept location | `resource` |
|-----------------|--------|------------------|------------|
| A schema file | `SQL Schema File` | `schemas/<feature>.md` | the schema file |
| A declared table | `SQLite Table` | `tables/<table>.md` | the schema file that declares the table |
| A domain entity | `Entity` | `entities/<entity>.md` | none: an entity is abstract |
| A query file | `SQL Query` | `queries/<feature>.md` | the query file |
| An update file | `SQL Update` | `migrations/NNNN-<slug>.md` | the update file |
| The Go module | `Go Package` | `store.md` | `packages/store` |
| A question kept for later | `Discussion` | `discussions/<slug>.md` | none: nothing is planned from it |

`resource` is the repo path of the file, for example `packages/store/schema/auth.schema.sql`.

# Naming

- A table concept takes the table's name: `club_subscriptions.md`.
- An entity concept takes the singular entity in kebab-case: `club-subscription.md`.

# Body

| Concept | Sections |
|---------|----------|
| Schema file | `# Schema`: the tables and indexes the file declares, each table linked to `/tables/<table>.md` |
| Table | `# Schema`: one row per column (column, type, null, default, description, key or reference); `# Keys`: primary key, unique and plain indexes; links to its entity and to the queries that touch it |
| Entity | `# Definition`, `# Invariants`, `# Lifecycle`, `# Vocabularies` (allowed values of open `TEXT` columns), `# Relations` (links to other entities); links to its tables and queries |
| Query file | `# Operations`: one section per operation (name, cardinality, inputs, result, tables touched) |
| Update file | `# Update`: its title, whether it is automatic, and what it changes, each table linked to `/tables/<table>.md` |
| Discussion | `# Status` (nothing planned, and the decision in force), `# The question`, `# What the user said` (quoted), `# Ideas raised` |

- Every schema file, query file and declared table has exactly one concept.
- Every entity the tables represent has a concept that links its tables and queries.
- The indexes are hand-written: each groups its concepts under headings, with their descriptions.

# Checks

Run `make check-docs` from `packages/store`. It checks a non-empty `type` in every concept, and every schema and query
file named by some concept's `resource`. Check the index listings and the table and entity concepts by hand, or run
`check.py` of the `documenting-with-okf` skill.
