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
└── queries/
    ├── index.md
    └── <feature>.md    # one concept per query file
```

Concept types by source artifact:

| Source artifact | `type` | Concept location |
|-----------------|--------|------------------|
| A declared table | `SQLite Table` | `schemas/<feature>.md` (section per table) or `tables/<table>.md` |
| A schema file | `SQL Schema File` | `schemas/<feature>.md` |
| A query file | `SQL Query` | `queries/<feature>.md` (section per operation) |
| The Go module | `Go Package` | `store.md` |

`index.md` and `log.md` are reserved filenames and are never concept files.
Only the root `index.md` carries frontmatter (`okf_version: "0.2"`).

## Frontmatter rules

```yaml
---
type: <Concept type>        # REQUIRED, non-empty
title: <Display name>        # recommended
description: <One line>      # recommended, used by index entries
resource: <source path>      # recommended: repo-relative path of the documented file
tags: [store, sql]           # optional
timestamp: <ISO 8601>        # optional
---
```

`resource` must point at the actual file, for example
`packages/store/schema/auth.schema.sql`. Unknown keys and missing optional
fields are tolerated; a missing `type` is not.

## Body rules

- Prefer structural markdown over prose.
- `# Schema` for a column table (column, type, description, key/reference).
- `# Operations` for query docs (name, cardinality, inputs, result, tables touched).
- `# Examples` for short usage snippets.
- `# Citations` for external sources, numbered, at the end.
- Cross-link concepts with bundle-relative links (`/queries/ping.md`, `/schemas/auth.md`).
  Broken links are permitted while knowledge is being filled in.

## Index and log rules

- Every directory's `index.md` lists its concepts with the linked concept's
  `description`, grouped under headings.
- `log.md` is optional; entries go under `## YYYY-MM-DD` headings, newest first.

## Conformance checklist

```text
OKF bundle:
- [ ] every schema and query file has exactly one concept
- [ ] every concept has frontmatter with a non-empty type
- [ ] resource points at the actual source file (repo-relative)
- [ ] description is a single sentence
- [ ] index.md lists every concept with its description
- [ ] root index.md declares okf_version: "0.2"
- [ ] cross-links and citations use markdown links
```

Run `make check-docs` from `packages/store` to verify the conformance rules the
repository enforces.

## Authoritative references

- [OKF annotated specification](https://okf.md/spec/)
- [Introducing the Open Knowledge Format (Google Cloud)](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
- [GoogleCloudPlatform/knowledge-catalog — okf](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)