---
name: documenting-with-okf
description: Writes and validates Open Knowledge Format (OKF) concept documents for the store knowledge bundle. Use when adding, updating, or reviewing concept documents under packages/store/knowledge/ or any project knowledge bundle.
---

# Documenting with OKF

## What OKF is

The [Open Knowledge Format](https://okf.md/spec/) is markdown plus YAML
frontmatter: each file is one concept, and a bundle is a directory of concept
files with `index.md` listings. It is readable by humans and agents, diffable,
and lives next to the code it describes.

## Project bundle layout

```text
packages/store/knowledge/
├── index.md            # root listing; declares okf_version: "0.2"
├── store.md            # the Go package (type: Go Package)
├── schemas/
│   ├── index.md
│   └── <feature>.md    # one concept per schema file
├── tables/
│   ├── index.md
│   └── <table>.md      # one concept per declared table
├── entities/
│   ├── index.md
│   └── <entity>.md     # one concept per domain entity
└── queries/
    ├── index.md
    └── <feature>.md    # one concept per query file
```

Concept types by source artifact:

| Source artifact | `type` | Concept location | `resource` |
|-----------------|--------|------------------|------------|
| A schema file | `SQL Schema File` | `schemas/<feature>.md` | the schema file |
| A declared table | `SQLite Table` | `tables/<table>.md` | the schema file that declares the table |
| A domain entity | `Entity` | `entities/<entity>.md` | none: an entity is abstract |
| A query file | `SQL Query` | `queries/<feature>.md` | the query file |
| The Go module | `Go Package` | `store.md` | `packages/store` |

Table concepts are named after the table (`club_subscriptions.md`); entity
concepts after the singular entity in kebab-case (`club-subscription.md`).

`index.md` and `log.md` are reserved filenames and are never concept files.
Only the root `index.md` carries frontmatter (`okf_version: "0.2"`).

## Frontmatter rules

```yaml
---
type: <Concept type>        # REQUIRED, non-empty
title: <Display name>        # recommended
description: <One line>      # recommended, used by index entries
resource: <source path>      # recommended, except for entities: repo-relative path of the documented file
tags: [store, sql]           # optional
timestamp: <ISO 8601>        # optional; always with an explicit offset, e.g. 2026-10-27T21:00:00+00:00
---
```

`resource` must point at the actual file, for example
`packages/store/schema/auth.schema.sql`. Unknown keys and missing optional
fields are tolerated; a missing `type` is not.

## Body rules

| Concept | Sections |
|---------|----------|
| Schema file | `# Schema`: the tables and indexes the file declares, each table linked to `/tables/<table>.md` |
| Table | `# Schema`: one row per column (column, type, null, default, description, key or reference); `# Keys`: primary key, unique and plain indexes; links to its entity and to the queries that touch it |
| Entity | `# Definition`, `# Invariants`, `# Lifecycle`, `# Vocabularies` (allowed values of open `TEXT` columns), `# Relations` (links to other entities); links to its tables and queries |
| Query file | `# Operations`: one section per operation (name, cardinality, inputs, result, tables touched) |

- Prefer structural markdown over prose.
- `# Examples` for short usage snippets.
- `# Citations` for external sources, numbered, at the end.
- Cross-link concepts with bundle-absolute links (`/queries/ping.md`,
  `/tables/users.md`, `/entities/user.md`). Broken links are permitted while
  knowledge is being filled in.

## Index and log rules

- Every directory's `index.md` lists its concepts with the linked concept's
  `description`, grouped under headings.
- `log.md` is optional; entries go under `## YYYY-MM-DD` headings, newest first.

## Conformance checklist

```text
OKF bundle:
- [ ] every schema file, query file and declared table has exactly one concept
- [ ] every entity the tables represent has a concept that links its tables and queries
- [ ] every concept has frontmatter with a non-empty type
- [ ] resource points at the actual source file (repo-relative); entities have none
- [ ] description is a single sentence
- [ ] index.md lists every concept with its description
- [ ] root index.md declares okf_version: "0.2"
- [ ] cross-links and citations use markdown links
```

Run `make check-docs` from `packages/store` to verify the conformance rules the
repository enforces: a non-empty `type` in every concept, and every schema and
query file named by some concept's `resource`. Index listings and the table
and entity concepts are not checked by it; verify them by hand.

## Authoritative references

- [OKF annotated specification](https://okf.md/spec/)
- [Introducing the Open Knowledge Format (Google Cloud)](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
- [GoogleCloudPlatform/knowledge-catalog — okf](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)
