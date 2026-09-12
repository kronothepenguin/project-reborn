# Phase 1 Data Model: Central Store Library

**Feature**: `specs/013-store-library` | **Date**: 2026-09-12

The store owns no domain data (decision C1). This model therefore describes the infrastructure artifacts it manages — runtime types, on-disk files, and documentation concepts — and the rules every future feature's schema/query contribution must follow.

## Runtime Types

### Store

| Field | Meaning | Invariants |
|-------|---------|------------|
| database handle | The single pool (one connection) to the SQLite file | Exactly one per process; foreign keys and WAL active on every connection |
| queries | The generated typed operations bound to the handle | Always usable once `Open` returns; no operation may exist outside this set |
| state | Open or closed | Operations after `Close` fail clearly; `Close` is idempotent |

Lifecycle: `Open(path)` → open file (creating it if absent) → enable `foreign_keys`, `journal_mode=WAL`, `busy_timeout` → apply declared schemas in filename order → ready. `Close()` releases the handle.

### Transaction (unit of work)

| Field | Meaning | Invariants |
|-------|---------|------------|
| queries | The same typed operations bound to the transaction | Operations inside see their own writes; operations on the Store do not see uncommitted changes |
| state | Active → committed or rolled back | Exactly one terminal transition; rollback after commit, or commit after rollback, is an error; a process exit without commit leaves no partial change |

### Error classes

Every operation resolves to exactly one class: success, not found (`sql.ErrNoRows`), data-rule violation (unique/primary-key, foreign-key, not-null, check), busy/locked, or other storage failure. Classification is by helper predicates; a failed operation never leaves a partial write.

## File Artifacts

### Schema file (`schema/<feature>.schema.sql`)

- Declarative, additive DDL only: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `CREATE UNIQUE INDEX IF NOT EXISTS`.
- No `DROP`, no `ALTER`, no data statements. No destructive rewrite of an existing structure (out of scope; future migration feature).
- Applied in lexicographic filename order on every open; files must be safe to execute repeatedly.
- `schema/store.schema.sql` is reserved and comment-only in this version; it exists so embedding and generation have a non-empty schema set.
- Cross-file references are allowed; filenames should group by feature so ownership is obvious.

### Query file (`queries/<feature>.query.sql`)

- Named operations annotated for generation: `-- name: <Operation> :one|:many|:exec|:execrows|:execlastid`.
- Reads use `:one`/`:many`; mutations use `:exec`/`:execrows`/`:execlastid` as appropriate.
- Column names and table names in `snake_case`; results ordered deterministically when the operation returns a list (explicit `ORDER BY`).
- Generated artifacts for the file are committed next to the hand-written code (`<feature>.query.sql.go`).
- `queries/ping.query.sql` provides the initial `Ping :one` operation (`SELECT 1`), keeping the generation pipeline non-empty.

### SQL value mapping (project convention)

| Logical value | Column type | Go type (generated) | Notes |
|---------------|-------------|---------------------|-------|
| Identifier | `INTEGER PRIMARY KEY` | `int64` | Autoincrement unless a feature defines otherwise |
| Text | `TEXT` | `string` | UTF-8, non-ASCII round-trips |
| Boolean | `INTEGER` | `bool` | `0` false, `1` true |
| Count/amount | `INTEGER` | `int64` | Money and credits are integers |
| Ratio/measure | `REAL` | `float64` | |
| Time | `INTEGER` | `int64` | Unix seconds UTC; never local time |
| Binary | `BLOB` | `[]byte` | |
| Nullable column | any | `sql.Null*` | Generated unless a feature states otherwise |

### Knowledge concept (`knowledge/**/*.md`)

| Field | Required | Meaning | Invariants |
|-------|----------|---------|------------|
| `type` | yes | Concept type (`SQLite Table`, `SQL Schema File`, `SQL Query`, `Go Package`) | Non-empty; part of OKF conformance |
| `title` | recommended | Human-readable name | |
| `description` | recommended | One-line summary used by the index | |
| `resource` | recommended | Repo-relative path to the documented source file | Exactly one concept per source file |
| `tags` | optional | Cross-cutting labels | |
| `timestamp` | optional | ISO 8601 last significant update | |
| body | yes | `# Schema`, `# Operations`, `# Examples`, `# Citations` as applicable | Links use bundle-relative paths; citations back external claims |

`index.md` lists every concept; `log.md` records additions when present. A schema or query file without a linked concept is an incomplete contribution.

## Documentation Artifacts (skills)

| Skill | Responsibility | Invariants |
|-------|----------------|------------|
| `documenting-with-okf` | How to write and validate OKF concepts in this project | Contains description, conformance checklist, and authoritative links |
| `adding-data-persistence` | From a data need to working typed operations in the store | References the OKF skill; lists every step and verification gate |

## Relationships

```text
Store 1 ── * Schema file          (applied on Open, filename order)
Store 1 ── * Query operation      (generated from query files, bound to Store/Tx)
Schema file 1 ── 1 Knowledge concept (resource link)
Query file  1 ── 1 Knowledge concept (resource link)
Knowledge concept * ── * Knowledge concept (bundle-relative links)
Feature 1 ── * Schema file / Query file (ownership)
```
