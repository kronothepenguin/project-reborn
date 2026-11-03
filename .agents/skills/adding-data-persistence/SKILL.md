---
name: adding-data-persistence
description: Takes a feature from needing persisted data to working typed operations in packages/store, covering schema files, query files, OKF documentation, sqlc generation, and consumption. Use when an app or feature needs new persisted data, a new table, or a new query in the shared store.
---

# Adding data persistence

Follow these steps in order. Work from the repository root unless stated.

1. **Choose the feature filename family.** Pick a lowercase kebab-case name,
   for example `auth`, and use `auth.schema.sql` and `auth.query.sql`.

2. **Add or change the schema file** `packages/store/schema/<feature>.schema.sql`.
   It describes the database as it is now, for sqlc and the docs, with
   `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` /
   `CREATE UNIQUE INDEX IF NOT EXISTS`. Edit a table in place when it changes.

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

3. **Add an update file** `packages/store/migrations/NNNN-<slug>.sql`, with
   the next free number, holding the same change. It is how an existing
   database gets it, and every program carries it. The test
   `TestTheUpdatesBuildTheDatabaseTheSchemaFilesDescribe` fails when the schema
   files and the updates describe different databases.

   | Part | Rule |
   | --- | --- |
   | First line | `-- <one sentence>`, the title housekeeping shows |
   | Mark | `-- automatic` among the first comments when sign-in, housekeeping's access check or its update page read what the update adds |
   | New table or index | the statement exactly as in the schema file |
   | New column | `ALTER TABLE ... ADD COLUMN` with the column's text from the schema file |
   | Any other table change | rebuild the table: create the new one, copy the rows, drop the old one, rename the new one, create its indexes again |
   | Seed rows | fixed ids and `INSERT OR IGNORE`, so rows an administrator changed stay |
   | New attribute in `packages/auth` | an update that grants it to the holders of `housekeeping.accessGroups` |

   An update runs in one transaction with foreign keys off, and
   `PRAGMA foreign_key_check` must find nothing before the commit. So
   `ON DELETE CASCADE` does not fire: delete child rows yourself. Never rely on
   values an administrator can change, such as a group's name. A released
   update never changes: a fix is a new update. A feature branch renumbers its
   updates when another branch merged the same numbers first.

4. **Add named operations** `packages/store/queries/<feature>.query.sql`.
   Every statement starts with `-- name: <Operation> :one|:many|:exec|:execrows|:execlastid`.
   Reads use `:one`/`:many`; mutations use the `:exec*` forms. List reads
   include an explicit `ORDER BY`. Times arrive as parameters from Go; never use
   `CURRENT_TIMESTAMP`. No ad-hoc SQL in applications.

5. **Document the change** with the `documenting-with-okf` skill
   (`.agents/skills/documenting-with-okf/SKILL.md`), in
   `packages/store/knowledge/`:
   - one concept per schema file in `schemas/<feature>.md`;
   - one concept per query file in `queries/<feature>.md`;
   - one concept per update file in `migrations/<file>.md`;
   - one concept per table in `tables/<table>.md`;
   - a new or updated concept in `entities/<entity>.md` for each entity the
     tables represent;
   - every concept listed in its directory `index.md`.

6. **Generate the typed operations.** From `packages/store` run
   `go tool sqlc generate` (or `make generate`). Commit the generated
   `<feature>.query.sql.go` file; never edit it by hand.

7. **Consume through the store.** Open the database once per process with
   `store.Open(path)` (or `store.Must(store.Open(path))`), which gives a new
   database every update and writes nothing to an existing one, and bind the
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

8. **Verify.** From `packages/store`: `go vet ./...` and `go test ./...`
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
- [ ] the schema file describes the tables as they are now, with IF NOT EXISTS
- [ ] an update file with the same change: next free number, a title, `-- automatic` when sign-in needs it
- [ ] table, column, index and foreign-key names follow the naming rules
- [ ] instants are DATETIME, dates are DATE, flags are BOOLEAN; no TIME columns
- [ ] every table referenced by a foreign key is declared before code writes the child
- [ ] every operation is named and given a cardinality
- [ ] list operations specify ORDER BY; times come from Go, never CURRENT_TIMESTAMP
- [ ] OKF concepts for each schema file, query file, update file, table and entity, linked and indexed
- [ ] `go tool sqlc generate` re-run; generated files committed
- [ ] `go vet ./...` and `go test ./...` pass from packages/store
- [ ] `make check-docs` exits 0
```
