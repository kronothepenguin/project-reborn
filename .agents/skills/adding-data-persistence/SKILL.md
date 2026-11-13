---
name: adding-data-persistence
description: Takes a feature from needing persisted data to working typed operations in a Go project's SQLite store built with sqlc, covering schema files, numbered update files, named queries, generation, documentation and consumption. Use when an app or feature needs new persisted data, a new table, column, index or seed rows, or a new query in the shared store.
---

# Adding data persistence

The project's knowledge names the folders, the commands and the checks. Read its playbook for persisted data first.

## Workflow

```text
New persisted data:
- [ ] 1. Schema file
- [ ] 2. Update file
- [ ] 3. Query file
- [ ] 4. Generate
- [ ] 5. Document
- [ ] 6. Consume
- [ ] 7. Check
```

1. **Schema file.** Name it after the feature in lowercase kebab-case: `orders.schema.sql`. It describes the database
   as it is now. Use `CREATE TABLE IF NOT EXISTS` and `CREATE [UNIQUE] INDEX IF NOT EXISTS`, and edit a table in
   place when it changes. Follow the [schema rules](#schema-rules).
2. **Update file.** Add `NNNN-<slug>.sql` with the next free number, in the same commit, holding the same change. It
   is how an existing database gets the change. Follow the [update rules](#update-rules).
3. **Query file.** Add the operations to `<feature>.query.sql`.
   - Start every statement with `-- name: <Operation> :one|:many|:exec|:execrows|:execlastid`.
   - Reads use `:one` or `:many`; mutations use the `:exec*` forms.
   - Every list read has an explicit `ORDER BY`.
   - Every time arrives as a parameter from Go.
4. **Generate** the typed operations with sqlc and commit the generated files. Change them through the SQL and
   regenerate.
5. **Document** with the `documenting-with-okf` skill: one concept per schema file, query file, update file and table,
   and one per entity the tables represent, laid out as the store bundle's playbook says.
6. **Consume.** Applications reach the database through the store and its generated operations only.
   - Open the database once per process through the store. A new database gets every update; an existing one changes
     only through updates.
   - Bind the operations with the generated `New(db)`.
   - Run writes that succeed together in one transaction, every write through the bound `qtx`:

     ```go
     tx, err := db.BeginTx(ctx, nil)
     if err != nil {
     	return err
     }
     defer tx.Rollback()

     qtx := q.WithTx(tx)
     // every write of the unit goes through qtx

     return tx.Commit()
     ```

   - Classify errors with the store's helpers: not found, conflict, foreign key, busy.
7. **Check.** Vet and tests pass, the docs check exits 0, and regenerating leaves the generated files unchanged.

## Schema rules

| Rule | Convention |
| --- | --- |
| Names | `snake_case`; tables plural; indexes `idx_<table>_<columns>` |
| Foreign keys | `<referenced_table_singular>_id`: `user_id`; a second reference to the same table, or a non-owner role, takes a role prefix: `edited_by_user_id` |
| Deletion | `ON DELETE CASCADE` for owned rows; `ON DELETE SET NULL` for authorship |
| Instants | `DATETIME`, written from Go as a UTC `time.Time` |
| Calendar dates | `DATE` |
| Time columns | `DATETIME` or `DATE`; sqlc maps `TIME` to no Go type |
| Flags | `BOOLEAN` with `TRUE`/`FALSE` |
| Text | UTF-8 `TEXT`, stored raw; escape when rendering |
| `CHECK` | closed sets only (`'M'`/`'F'`, quantities ≥ 0); open vocabularies are `TEXT` validated by Go constants |

## Update rules

| Part | Rule |
| --- | --- |
| First line | `-- <one sentence>`, the title the update page shows |
| Mark | `-- automatic` among the first comments when sign-in, the administration's access check or its update page read what the update adds |
| New table or index | the statement exactly as in the schema file |
| New column | `ALTER TABLE ... ADD COLUMN` with the column's text from the schema file |
| Any other table change | rebuild the table: create the new one, copy the rows, drop the old one, rename the new one, create its indexes again |
| Seed rows | fixed ids and `INSERT OR IGNORE`, so rows an administrator changed stay |
| New permission attribute | an update that grants it to the holders of the attribute that manages access |

- An update runs in one transaction with foreign keys off, and `PRAGMA foreign_key_check` finds nothing before the
  commit. Delete child rows in the update itself: `ON DELETE CASCADE` stays silent there.
- Select rows by the values the program fixes, such as ids; an administrator can change the rest, such as a group's
  name.
- A released update stays as written; a fix is a new update.
- A feature branch renumbers its updates when another branch merged the same numbers first.

## Gotchas

- The store's pool holds one connection. Inside a transaction use only `qtx`; `db` or an unbound `Queries` waits
  forever for the connection the transaction holds.
- Declare every table a foreign key references before code writes the child: SQLite answers `no such table` even for
  a `NULL` key.
- `CURRENT_TIMESTAMP` writes `YYYY-MM-DD HH:MM:SS` with no offset, and the store writes
  `YYYY-MM-DD HH:MM:SS.fffffffff+00:00`; the two break comparisons and ordering. Pass times from Go.
- sqlc gives a parameter the nullability of the column it meets, even with `sqlc.arg`. Wrap integer and text
  parameters in `CAST(sqlc.arg(x) AS INTEGER)` or `CAST(sqlc.arg(x) AS TEXT)` to get `int64` or `string`.
- sqlc types a parameter from its first use. Type a time parameter by comparing it first with a `NOT NULL` column;
  a `CAST` turns a time into a number, since `DATETIME` has NUMERIC affinity.
