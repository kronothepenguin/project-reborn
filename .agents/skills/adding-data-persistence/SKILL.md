---
name: adding-data-persistence
description: Takes a feature from needing persisted data to working typed operations in packages/store, covering schema files, query files, OKF documentation, sqlc generation, and consumption. Use when an app or feature needs new persisted data, a new table, or a new query in the shared store.
---

# Adding data persistence

Follow these steps in order. Work from the repository root unless stated.

1. **Choose the feature filename family.** Pick a lowercase kebab-case name,
   for example `auth`, and use `auth.schema.sql` and `auth.query.sql`.

2. **Add the schema file** `packages/store/schema/<feature>.schema.sql`.
   Use additive, idempotent DDL only: `CREATE TABLE IF NOT EXISTS` and
   `CREATE INDEX IF NOT EXISTS` / `CREATE UNIQUE INDEX IF NOT EXISTS`. Never
   `DROP`, `ALTER`, `INSERT`, `UPDATE`, or `DELETE`. Name tables and columns
   `snake_case` (tables plural); foreign keys are `<referenced_table_singular>_id`;
   indexes are `idx_<table>_<columns>`. Times are unix seconds UTC in `INTEGER`
   columns; booleans are `INTEGER` 0/1; text is UTF-8 `TEXT`.

3. **Add named operations** `packages/store/queries/<feature>.query.sql`.
   Every statement starts with `-- name: <Operation> :one|:many|:exec|:execrows|:execlastid`.
   Reads use `:one`/`:many`; mutations use the `:exec*` forms. List reads
   include an explicit `ORDER BY`. No ad-hoc SQL in applications.

4. **Document both files** with the `documenting-with-okf` skill
   (`.agents/skills/documenting-with-okf/SKILL.md`): one concept under
   `packages/store/knowledge/schemas/<feature>.md` and one under
   `packages/store/knowledge/queries/<feature>.md`, each with `type`,
   `description`, and `resource` frontmatter, listed in the directory indexes.

5. **Generate the typed operations.** From `packages/store` run
   `go tool sqlc generate` (or `make generate`). Commit the generated
   `<feature>.query.sql.go` file; never edit it by hand.

6. **Consume through the store.** Open with `store.Open(path)` and call the
   generated methods directly. Use `(*Store).Begin` for multi-step writes and
   classify errors with `IsNotFound`, `IsConflict`, `IsForeignKey`, `IsBusy`.
   Applications never import a driver or execute SQL themselves.

7. **Verify.** From `packages/store`: `go vet ./...` and `go test ./...`
   pass; `make check-docs` exits 0; regenerating with `go tool sqlc generate`
   leaves `git diff --exit-code` clean.

## Contribution checklist

```text
New persisted data:
- [ ] schema file is additive and idempotent (no DROP/ALTER/DML)
- [ ] table/column/index names follow the naming rules
- [ ] times are unix seconds UTC; booleans are 0/1
- [ ] every operation is named and given a cardinality
- [ ] list operations specify ORDER BY
- [ ] one OKF concept per schema file and per query file, linked and indexed
- [ ] `go tool sqlc generate` re-run; generated files committed
- [ ] `go vet ./...` and `go test ./...` pass from packages/store
- [ ] `make check-docs` exits 0
```