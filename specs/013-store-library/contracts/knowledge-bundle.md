# Contract: OKF Knowledge Bundle

**Feature**: `specs/013-store-library` | **Date**: 2026-09-12

The store's knowledge bundle follows [OKF v0.2](https://okf.md/spec/) and is the documentation source of truth for every persisted structure and operation. The `documenting-with-okf` skill teaches this contract.

## Location and layout

```text
packages/store/knowledge/
├── index.md            # root listing; declares okf_version: "0.2"
├── store.md            # the store infrastructure (type: Go Package)
├── schemas/
│   ├── index.md
│   └── <feature>.md    # one concept per schema file
└── queries/
    ├── index.md
    └── <feature>.md    # one concept per query file
```

Every non-reserved `*.md` file is a concept document. `index.md` and `log.md` are reserved filenames and never used for concepts.

## Concept frontmatter

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

Project concept types:

| Source artifact | `type` | Concept location |
|-----------------|--------|------------------|
| A declared table | `SQLite Table` | `schemas/<feature>.md` (one section per table) or `tables/<table>.md` |
| A schema file | `SQL Schema File` | `schemas/<feature>.md` |
| A query file | `SQL Query` | `queries/<feature>.md` (one section per operation) |
| The Go module itself | `Go Package` | `store.md` |

A feature file that declares tables may document each table in its `schemas/<feature>.md` concept or as separate `tables/<table>.md` concepts; either way the file's concept links to them.

## Body conventions

- Prefer structural markdown over prose.
- Use `# Schema` for a column table (column, type, description, key/reference).
- Use `# Operations` for query documentation (name, cardinality, inputs, result, tables touched).
- Use `# Examples` for short usage snippets.
- Use `# Citations` for external sources, numbered, at the end.
- Cross-link concepts with bundle-relative links (`/queries/ping.md`, `/schemas/auth.md`). Broken links are permitted while knowledge is being filled in.

## Index and log

- Each directory's `index.md` lists its concepts with the linked concept's `description`, grouped under headings. The root `index.md` is the only file where frontmatter is allowed; it declares `okf_version: "0.2"`.
- `log.md` is optional; when present, entries are grouped under `## YYYY-MM-DD` headings, newest first.

## Conformance

A bundle is conformant when:

1. Every non-reserved `.md` file has parseable YAML frontmatter.
2. Every frontmatter block has a non-empty `type`.
3. Every `index.md`/`log.md` follows the shapes above.
4. Every schema and query file has a linked concept listed in an index.

Unknown frontmatter keys, unknown types, missing optional fields, and broken links are tolerated by consumers.

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

## Authoritative references

- [OKF annotated specification](https://okf.md/spec/)
- [Introducing the Open Knowledge Format (Google Cloud)](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
- [GoogleCloudPlatform/knowledge-catalog — okf](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)
