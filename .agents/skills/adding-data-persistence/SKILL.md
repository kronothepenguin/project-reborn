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
   `DROP`, `ALTER`, `INSERT`, `UPDATE`, or `DELETE`. A table can never gain a
   column later, so declare it complete and give a new concern its own table.

   | Rule | Convention |
   | --- | --- |
   | Names | `snake_case`; tables plural; indexes `idx_<table>_<columns>` |
   | Foreign keys | `<referenced_table_singular>_id`; a second reference to the same table, or a non-owner role, gets a role prefix (`edited_by_avatar_id`) |
   | Deletion | `ON DELETE CASCADE` for owned rows; `ON DELETE SET NULL` for authorship |
   | Instants | `DATETIME`, always written from Go as UTC `time.Time` |
   | Calendar dates | `DATE` |
   | Flags | `BOOLEAN` with `TRUE`/`FALSE` |
   | Text | UTF-8 `TEXT`, stored raw; escaping happens when rendering |
   | `CHECK` | only for closed sets (`'M'`/`'F'`, quantities ≥ 0); open vocabularies stay `TEXT` validated by Go constants |

   Never declare `TIME` columns: sqlc does not map them to a Go type.

3. **Add named operations** `packages/store/queries/<feature>.query.sql`.
   Every statement starts with `-- name: <Operation> :one|:many|:exec|:execrows|:execlastid`.
   Reads use `:one`/`:many`; mutations use the `:exec*` forms. List reads
   include an explicit `ORDER BY`. Times arrive as parameters from Go; never use
   `CURRENT_TIMESTAMP`. No ad-hoc SQL in applications.

4. **Document the change** with the `documenting-with-okf` skill
   (`.agents/skills/documenting-with-okf/SKILL.md`), in
   `packages/store/knowledge/`:
   - one concept per schema file in `schemas/<feature>.md`;
   - one concept per query file in `queries/<feature>.md`;
   - one concept per table in `tables/<table>.md`;
   - a new or updated concept in `entities/<entity>.md` for each entity the
     tables represent;
   - every concept listed in its directory `index.md`.

5. **Generate the typed operations.** From `packages/store` run
   `go tool sqlc generate` (or `make generate`). Commit the generated
   `<feature>.query.sql.go` file; never edit it by hand.

6. **Consume through the store.** Open the database once per process with
   `store.Open(path)` (or `store.Must(store.Open(path))`) and bind the
   operations with `store.New(db)`. Run writes that must succeed together in
   one transaction:

   ```go
   q := store.New(db)

   tx, err := db.BeginTx(ctx, nil)
   if err != nil {
   	return err
   }
   defer tx.Rollback()

   qtx := q.WithTx(tx)
   // every write of the unit goes through qtx

   return tx.Commit()
   ```

   Classify errors with `store.IsNotFound`, `store.IsConflict`,
   `store.IsForeignKey` and `store.IsBusy`. Applications never import a driver
   or execute SQL themselves.

7. **Verify.** From `packages/store`: `go vet ./...` and `go test ./...`
   pass; `make check-docs` exits 0; regenerating with `go tool sqlc generate`
   leaves the generated files unchanged
   (`git diff --exit-code -- db.go models.go '*.query.sql.go'`).

## Gotchas

- The pool has a single connection. Inside a transaction use only `qtx`;
  touching `db` or an unbound `Queries` there waits forever for the connection
  the transaction holds.
- A child table cannot be written while a table its foreign keys reference does
  not exist, even when the key is `NULL`: SQLite fails with `no such table`.
  Declare every referenced table before any code writes the child.
- `CURRENT_TIMESTAMP` produces `YYYY-MM-DD HH:MM:SS` without an offset, while the
  store writes `YYYY-MM-DD HH:MM:SS.fffffffff+00:00` (`_time_format=sqlite`);
  mixing the two breaks comparisons and ordering.
- sqlc gives a parameter the nullability of the column it is compared with or
  inserted into, even with `sqlc.arg`. Wrap integer and text parameters in
  `CAST(sqlc.arg(x) AS INTEGER)` or `CAST(sqlc.arg(x) AS TEXT)` to get `int64`
  or `string`. Never `CAST` a time: `DATETIME` has NUMERIC affinity and turns
  the text into a number. For a time, compare the parameter with a `NOT NULL`
  column first, because sqlc types a parameter from its first use.

## Contribution checklist

```text
New persisted data:
- [ ] schema file is additive and idempotent (no DROP/ALTER/DML)
- [ ] table, column, index and foreign-key names follow the naming rules
- [ ] instants are DATETIME, dates are DATE, flags are BOOLEAN; no TIME columns
- [ ] every table referenced by a foreign key is declared before code writes the child
- [ ] every operation is named and given a cardinality
- [ ] list operations specify ORDER BY; times come from Go, never CURRENT_TIMESTAMP
- [ ] OKF concepts for each schema file, query file, table and entity, linked and indexed
- [ ] `go tool sqlc generate` re-run; generated files committed
- [ ] `go vet ./...` and `go test ./...` pass from packages/store
- [ ] `make check-docs` exits 0
```
