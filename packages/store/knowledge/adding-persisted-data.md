---
type: Playbook
title: Adding persisted data
description: Where new persisted data goes in packages/store, the generator, the checks and tests that guard it, and the helpers a consumer calls, for the adding-data-persistence skill.
---

# Skill

The `adding-data-persistence` skill holds the rules. This playbook names their places in this repo.

# Files

| File | Place |
| --- | --- |
| Schema file | `packages/store/schema/<feature>.schema.sql` |
| Update file | `packages/store/migrations/NNNN-<slug>.sql`, embedded in every program |
| Query file | `packages/store/queries/<feature>.query.sql` |
| Generated operations | `packages/store/<feature>.query.sql.go`, `db.go` and `models.go` |
| Generator settings | `packages/store/sqlc.yaml` |
| Concepts | the layout and bodies of the [store bundle](/bundle.md) |

How updates apply and how to write one: [How database updates work](/database-updates.md).

- Sign-in is the CMS's (`packages/cms`); the access check and the update page are housekeeping's
  (`packages/housekeeping`).
- A new attribute in the catalogue of `packages/auth` comes with an update that grants it to the holders of
  `housekeeping.accessGroups`.

# Generate

From `packages/store`:

```sh
go tool sqlc generate    # or: make generate
```

# Consume

The functions are in [Store](/store.md).

- Open: `store.Open(path)` or `store.Must(store.Open(path))`; a runner calls `store.FromConfig()`.
- Bind: `store.New(db)`, and `q.WithTx(tx)` inside a transaction.
- Classify errors: `store.IsNotFound`, `store.IsConflict`, `store.IsForeignKey` and `store.IsBusy`.

# Checks

From `packages/store`:

```sh
go vet ./...
go test ./...            # make test adds -race
make check-docs
go tool sqlc generate
git diff --exit-code -- db.go models.go '*.query.sql.go'
```

From the repo root, `python3 -I .agents/skills/documenting-with-okf/scripts/check.py packages/store/knowledge`.

# Tests that guard the rules

| Test | File | Fails when |
| --- | --- | --- |
| `TestTheUpdatesBuildTheDatabaseTheSchemaFilesDescribe` | `packages/store/schema_files_test.go` | the schema files and the updates describe different databases |
| `TestSignInWorksOnTheDatabaseStartUpLeaves` | `packages/cms/signin_test.go` | an update the CMS's sign-in needs lacks its `-- automatic` mark |
| `TestTheUpdatePageOpensOnTheDatabaseStartUpLeaves` | `packages/housekeeping/signin_test.go` | an update housekeeping's sign-in or update page needs lacks its `-- automatic` mark |
| `TestTheGroupsManagingAccessHoldEveryAttribute` | `packages/auth/attributes_test.go` | a new attribute comes without its granting update |
