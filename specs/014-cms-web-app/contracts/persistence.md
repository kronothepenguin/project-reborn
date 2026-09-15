# Persistence Contract: CMS Web Application

**Feature**: `014-cms-web-app` | **Date**: 2026-09-12

Persistence follows the `adding-data-persistence` and `documenting-with-okf` skills. Column definitions, validation rules, and state transitions live in [data-model.md](../data-model.md); this contract fixes the SQL file families, the operation surface, the auth adapter behaviour, and the conformance gates.

**Family rule** (user direction 2026-09-12): a file family is named after the domain it encapsulates, never after the package or feature that introduces it. A `.schema.sql` file may declare one or many tables, all related to its family name. Multi-word families are lowercase kebab-case; tables remain `snake_case` plural.

---

## Schema files

| File | Declares |
|---|---|
| `packages/store/schema/users.schema.sql` | `users` |
| `packages/store/schema/sessions.schema.sql` | `sessions`, `idx_sessions_user_id`, `idx_sessions_absolute_expires_at` |
| `packages/store/schema/recovery-tokens.schema.sql` | `recovery_tokens`, `idx_recovery_tokens_user_id` |
| `packages/store/schema/login-attempts.schema.sql` | `login_attempts` |

Rules: `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` only; no `DROP`, `ALTER`, DML, or foreign keys to structures outside these files; unix seconds, 0/1 booleans; foreign keys `user_id` referencing `users(id)` with `ON DELETE CASCADE`. Schemas apply in lexicographic filename order; SQLite resolves the `users` foreign key at execution time, so declaration order is safe.

## Query files

Every statement is `-- name: <Operation> :<cardinality>`, reads use `:one`/`:many`, mutations use `:exec`/`:execlastid`/`:execrows`, and every list has an explicit `ORDER BY`. Generated files (`users.query.sql.go`, `sessions.query.sql.go`, `recovery-tokens.query.sql.go`, `login-attempts.query.sql.go`) are committed and never edited by hand.

### `packages/store/queries/users.query.sql`

```sql
-- name: CreateUser :execlastid
-- name: GetUserByID :one
-- name: GetUserByUsername :one        -- canonical input
-- name: GetUserByEmail :one           -- canonical input
-- name: UpdateUserMotto :exec
-- name: UpdateUserPassword :exec
-- name: MarkUserSignedIn :exec
```

Semantics:

- `GetUserByUsername` / `GetUserByEmail` are the only lookups by natural key and always receive canonical (lower-cased) values.
- `CreateUser` returns the new `users.id`; a unique-constraint conflict on `username_canonical`/`email_canonical` maps to the corresponding registration field error even if a pre-check passed (race-safe).

### `packages/store/queries/sessions.query.sql`

```sql
-- name: CreateSession :exec
-- name: GetSession :one
-- name: TouchSession :exec            -- updates only last_seen_at, idle_expires_at
-- name: RevokeSession :exec           -- only updates rows where revoked_at = 0
-- name: ListUserSessions :many        -- ORDER BY created_at DESC
-- name: PurgeSessions :execrows       -- DELETE revoked or past-deadline; returns count
```

Semantics:

- `CreateSession` is insert-only; a duplicate digest errors and must never upsert.
- `GetSession` returns the row regardless of `revoked_at` (the library inspects it); absence is `sql.ErrNoRows`.
- `RevokeSession` is idempotent.
- `PurgeSessions` deletes rows where `revoked_at != 0 OR idle_expires_at <= ? OR absolute_expires_at <= ?`.

### `packages/store/queries/recovery-tokens.query.sql`

```sql
-- name: CreateRecoveryToken :exec
-- name: GetRecoveryToken :one         -- by digest
-- name: UseRecoveryToken :exec        -- WHERE id = ? AND used_at = 0
-- name: DeleteUserRecoveryTokens :exec
```

`CreateRecoveryToken` stores only the digest; the raw token never reaches the database.

### `packages/store/queries/login-attempts.query.sql`

```sql
-- name: UpsertLoginFailure :exec      -- window-aware increment
-- name: GetLoginAttempt :one
-- name: LockLoginAttempt :exec        -- set locked_until
-- name: ClearLoginAttempt :exec       -- delete by key
```

`UpsertLoginFailure` increments `failures`; when `updated_at` is older than the window it restarts at 1 and also reflects the new `updated_at`.

## Error classification

Applications never see driver errors: the account service and adapter classify with `store.IsNotFound`, `store.IsConflict`, `store.IsForeignKey`, `store.IsBusy`. A busy store fails closed with an error, never a silent success.

## Auth adapter contract (`packages/cms/internal/authstore`)

| Interface | Implementation notes |
|---|---|
| `Creator` | `CreateSession`; insert-only |
| `Validator` | `GetSession`; `store.IsNotFound` → `auth.ErrNotFound`; other errors wrapped and returned |
| `Toucher` | `TouchSession` with `LastSeenAt`/`IdleExpiresAt` |
| `Revoker` | `RevokeSession`; proceeds on absent rows |
| `AccountRevoker` | One `store.Begin` transaction: list the user's sessions with `ListUserSessions`, filter `revoked_at = 0` and `id != except`, revoke each, commit, return the revoked records; rollback on any error |
| `Lister` | `ListUserSessions`; the library filters deadlines/revocation |
| `Purger` | `PurgeSessions(now)`; returns the removed row count |

`auth.AccountID` maps to `users.id` and `sessions.user_id`. Time conversion: unix seconds UTC ↔ `time.Time`; 0/1 ↔ `bool`; empty `user_agent`/`address` strings stored as `''`.

## Conformance gates

From `packages/store`:

```sh
go tool sqlc generate        # regenerates *.query.sql.go; generated files committed
make check-docs              # every schema/query file has an OKF concept
go vet ./... && go test ./...
git diff --exit-code         # regeneration leaves no diff
```
