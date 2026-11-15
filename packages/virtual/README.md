# virtual

In-memory state of Project Reborn's entities, one package per entity. Nothing here keeps a database connection: every
function that reads or writes the database receives the `*sql.DB`, and the program that opened it stays its owner.

How it works: `knowledge/index.md`.

## Check

From `packages/virtual`:

```sh
make check
```
