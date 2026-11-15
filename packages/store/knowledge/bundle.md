---
type: Playbook
title: Store bundle
description: The layout of this bundle, its concept types and what make check-docs checks.
---

# Layout

```text
packages/store/knowledge/
├── index.md                  # root listing; declares okf_version: "0.2"
├── store.md                  # the Go package (type: Go Package)
├── bundle.md                 # this playbook
├── tables.md                 # every table, grouped by entity (type: Reference)
├── adding-persisted-data.md  # the adding-data-persistence skill's places in this repo (type: Playbook)
├── database-updates.md       # how updates reach an installed hotel (type: Reference)
└── discussions/
    ├── index.md
    └── <slug>.md             # one question kept for a later discussion (type: Discussion)
```

# Tables

- [Tables](/tables.md) has one heading per entity, with one sentence saying what it is, and one table under it.
- Each row is one database table: its name, what it holds in one line, and its schema file.
- `# Notes` holds what the SQL cannot show and a query needs: the values of open `TEXT` columns and the rules between
  tables.
- The schema files hold the columns, keys and checks.

# Discussion

A discussion has `# Status` (nothing planned, and the decision in force), `# The question`, `# What the user said`
(quoted) and `# Ideas raised`.

# Checks

Run `make check-docs` from `packages/store`. It checks that every table created in `schema/*.schema.sql` is a row of
`tables.md`, and that every row of `tables.md` names a table of the schema files. It prints each missing name.
`check.py` of the `documenting-with-okf` skill checks the frontmatter, the indexes and the links.
