# Contract: Store Library API

**Feature**: `specs/013-store-library` | **Date**: 2026-09-12

The public Go surface of `packages/store`. Signatures are normative; behavior below is what tests must verify.

## Package and module

- Module path: `github.com/kronothepenguin/project-reborn/packages/store`
- Package name: `store`
- Consumers import the module and use `store.Open`; they never import a database driver, call `sql.Open`, or execute SQL.

## Lifecycle

```go
// Open opens the SQLite file at path, creating it when absent, enables
// foreign keys, WAL journaling and a 5s busy timeout on every connection,
// applies all declared schemas in lexicographic filename order, and returns
// a ready Store. The parent directory must already exist.
func Open(path string) (*Store, error)

// Close releases the database handle. It is safe to call more than once.
func (s *Store) Close() error
```

- `Open` applies schemas idempotently: opening an existing database never changes existing data and never drops or alters structures the module did not declare.
- `Open` fails with an error naming the path when the parent directory is missing, the file is unwritable, or the file is not a valid database. It never deletes, truncates, or recreates a corrupt file.
- Every connection created by the pool has `PRAGMA foreign_keys = 1` and `journal_mode = WAL`; the pool is capped at one connection.

## Typed operations

- `Store` embeds the sqlc-generated `*Queries`; consumers call generated methods directly (for example `s.Ping(ctx)`, and future feature operations).
- Generated methods return raw driver errors. Consumers classify them with the helpers below; they must not pattern-match error strings.

## Units of work

```go
// Begin starts a transaction. All operations performed through the returned
// Tx use the same transaction.
func (s *Store) Begin(ctx context.Context) (*Tx, error)

// Tx embeds the generated *Queries bound to the transaction.
type Tx struct{ /* ... */ }

func (tx *Tx) Commit() error
func (tx *Tx) Rollback() error
```

- Changes made through a `Tx` become visible to other connections only after `Commit`.
- `Rollback` undoes every change in the unit; calling it after `Commit`, or `Commit` after `Rollback`, returns an error and leaves data unchanged.
- A process exit before `Commit` leaves no partial change behind.
- Concurrent conflicting transactions resolve by waiting up to the busy timeout, then fail with a busy error; they never corrupt data.

## Error classification

```go
func IsNotFound(err error) bool    // errors.Is(err, sql.ErrNoRows)
func IsConflict(err error) bool    // unique or primary-key violation
func IsForeignKey(err error) bool  // foreign-key violation
func IsBusy(err error) bool        // database busy or locked past the timeout
```

- All helpers are safe with wrapped errors (`errors.Is`/`errors.As` semantics).
- Operations must never partially apply when they return a non-nil error.

## Declared-but-empty surface

- The module exports no configuration options, no migration API, and no interface abstraction over the generated operations in this version. The database path is the only consumer-supplied value.

## Verification gates

- `go build ./... && go vet ./... && go test ./...` from `packages/store` all pass.
- `go tool sqlc generate` followed by `git diff --exit-code` produces no diff (generated code is in sync).
- A test asserts both pragmas immediately after `Open`.
- A subprocess test asserts busy/locked behavior across two processes sharing one file.
