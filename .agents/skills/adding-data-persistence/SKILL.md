---
name: adding-data-persistence
description: Takes a feature from needing persisted data to working typed operations in a Go project's SQLite store built with sqlc, covering the table list, schema files, numbered update files, named queries, generation and consumption. Use when an app or feature needs new persisted data, a new table, column, index or seed rows, or a new query in the shared store.
---

# Adding data persistence

The project's knowledge names the folders, the commands, the checks and the table list. Read its playbook for
persisted data first.

## Workflow

```text
New persisted data:
- [ ] 1. Read the table list
- [ ] 2. Schema file
- [ ] 3. Update file
- [ ] 4. Query file
- [ ] 5. Generate
- [ ] 6. Add the table to the list
- [ ] 7. Consume
- [ ] 8. Check
```

1. **Read the table list.** It holds every table, grouped by entity, with one line saying what it holds. Use a table
   or an entity that exists, or learn that the feature adds one.
2. **Schema file.** Name it after the feature in lowercase kebab-case: `orders.schema.sql`. It describes the database
   as it is now. Use `CREATE TABLE IF NOT EXISTS` and `CREATE [UNIQUE] INDEX IF NOT EXISTS`, and edit a table in
   place when it changes. Follow the [schema rules](#schema-rules).
3. **Update file.** Add `NNNN-<slug>.sql` with the next free number, in the same commit, holding the same change.
   Follow the [update rules](#update-rules).
4. **Query file.** Add the operations to `<feature>.query.sql`.
   - Start every statement with `-- name: <Operation> :one|:many|:exec|:execrows|:execlastid`.
   - Reads use `:one` or `:many`.
   - A write that hands back what it wrote uses `:one` or `:many` with `RETURNING`; every other write uses the
     `:exec` forms.
   - Every `SELECT` that returns a list has an explicit `ORDER BY`.
   - Every time arrives as a parameter from Go.
5. **Generate** the typed operations with sqlc and commit the generated files. Change them through the SQL and
   regenerate.
6. **Add the table to the list.** A new table gets its line under its entity. A new entity gets its heading with one
   sentence saying what it is.
7. **Consume.** Applications reach the database through the store and its generated operations only.
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

   - Classify errors with the store's helpers: not found, conflict and foreign key.
8. **Check.** Vet and tests pass, the docs check exits 0, and regenerating leaves the generated files unchanged.

## Schema rules

| Rule | Convention |
| --- | --- |
| Names | `snake_case`; indexes `idx_<table>_<columns>` |
| Table names | plural, always; a word with no plural form takes one: `equipments`, `luggages` |
| Foreign keys | `<referenced_table_singular>_id`: `user_id`; a second reference to the same table, or a non-owner role, takes a role prefix: `edited_by_user_id`; a table's link to itself is `parent_id` |
| Deletion | `ON DELETE CASCADE` for owned rows; `ON DELETE SET NULL` for authorship |
| Instants | `DATETIME`, written from Go as a UTC `time.Time` |
| Calendar dates | `DATE` |
| Time columns | `DATETIME` or `DATE`; sqlc maps `TIME` to no Go type |
| Flags | `BOOLEAN` with `TRUE`/`FALSE` |
| Text | UTF-8 `TEXT`, stored raw; escape when rendering |
| `CHECK` | closed sets (`'M'`/`'F'`), ranges (quantities ≥ 0) and relations between columns of one row (`ends_at > starts_at`); open vocabularies are `TEXT` validated by Go constants |

## Update rules

Updates bring every existing database to the new shape with its rows kept.

| Part | Rule |
| --- | --- |
| First line | `-- <one sentence>`, the title the update page shows |
| Mark | `-- automatic` among the first comments when sign-in, the administration's access check or its update page read what the update adds |
| New table or index | the statement exactly as in the schema file |
| New column | `ALTER TABLE ... ADD COLUMN` with the column's text from the schema file |
| Any other table change | rebuild the table: create the new one, copy the rows, drop the old one, rename the new one, create its indexes again |
| Seed rows | fixed ids and `INSERT OR IGNORE`, so rows an administrator changed stay |
| Times | `strftime` in the store's format, the expression the project's knowledge gives |
| New permission attribute | an update that grants it to the holders of the attribute that manages access |

- An existing database changes only through updates.
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
  `YYYY-MM-DD HH:MM:SS.fffffffff+00:00`; the two break comparisons and ordering. A query takes its times from Go.
- sqlc gives a parameter the nullability of the column it meets, even with `sqlc.arg`. Wrap integer and text
  parameters in `CAST(sqlc.arg(x) AS INTEGER)` or `CAST(sqlc.arg(x) AS TEXT)` to get `int64` or `string`.
- sqlc types a parameter from its first use. Type a time parameter by comparing it first with a `NOT NULL` column;
  a `CAST` turns a time into a number, since `DATETIME` has NUMERIC affinity.
