# Contract: SQL Conventions

**Feature**: `specs/013-store-library` | **Date**: 2026-09-12

Rules every schema and query contribution to the store must follow. The persistence skill teaches these rules; the OKF bundle documents each resulting file.

## Schema files (`packages/store/schema/<feature>.schema.sql`)

1. **Additive only.** Use `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` / `CREATE UNIQUE INDEX IF NOT EXISTS`. Never `DROP`, never `ALTER`, never `INSERT`/`UPDATE`/`DELETE`.
2. **Idempotent.** Executing the file any number of times leaves the database in the same state.
3. **One file per feature or domain.** The filename is lowercase kebab-case and matches the query file family (for example `auth.schema.sql`).
4. **Applied in filename order.** Cross-file references are allowed, but tables a feature owns belong in its own file.
5. **Naming.** Tables plural `snake_case`; columns `snake_case`; foreign keys `<referenced_table_singular>_id`; indexes `idx_<table>_<columns>`.
6. **Keys and integrity.** Declare `PRIMARY KEY`; declare `REFERENCES` for relationships; the connection always enforces foreign keys.
7. **Times are unix seconds UTC** in `INTEGER` columns. Booleans are `INTEGER` 0/1. Text is UTF-8 `TEXT`. See the value mapping in `data-model.md`.
8. **Documentation.** The file has exactly one OKF concept under `knowledge/schemas/` (or `knowledge/tables/<table>.md` for each table it declares), linked back to the file with `resource`.

## Query files (`packages/store/queries/<feature>.query.sql`)

1. **Named operations.** Every statement starts with `-- name: <Operation> :<cardinality>`, where cardinality is `:one`, `:many`, `:exec`, `:execrows`, or `:execlastid` as appropriate.
2. **One concern per operation.** Mutation operations mutate; read operations read. No multi-statement operation bodies beyond what the generator supports.
3. **Deterministic lists.** Read operations that return many rows include an explicit `ORDER BY`.
4. **No ad-hoc SQL in applications.** Any new data access is added here and consumed through generated methods.
5. **Generated code is committed.** `packages/store/<feature>.query.sql.go` is produced by `go tool sqlc generate` and never edited by hand.
6. **Documentation.** The file has exactly one OKF concept under `knowledge/queries/<feature>.md` describing each operation, its inputs/outputs, and the tables it touches; listed in the bundle index.

## Reserved infrastructure files

- `schema/store.schema.sql` — comment-only placeholder reserving the module's schema namespace; documented as a concept and excluded from feature ownership.
- `queries/ping.query.sql` — the `Ping` smoke query (`SELECT 1`); documented as a concept.

## Contribution checklist

```text
SQL contribution:
- [ ] schema file is additive and idempotent (no DROP/ALTER/DML)
- [ ] table/column/index names follow the naming rules
- [ ] times are unix seconds UTC; booleans are 0/1
- [ ] every operation is named and given a cardinality
- [ ] list operations specify ORDER BY
- [ ] one OKF concept per schema file and per query file, linked and indexed
- [ ] `go tool sqlc generate` re-run; generated files committed
- [ ] `go vet ./...` and `go test ./...` pass from packages/store
```
