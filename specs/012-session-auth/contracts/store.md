# Contract: Session Persistence Roles — 012

Applications implement these interfaces (SQL is app domain). Tests implement them in memory. The library defines only the contracts and depends on them (DIP); it ships **no** implementation and no driver dependency.

There are seven roles, each one method and one responsibility. A concrete store commonly implements all seven; library functions receive one argument per capability they use:

| Function | Roles used |
|---|---|
| `Create` | `Revoker` + `Creator` |
| `Validate` / `Protect` | `Validator` + `Toucher` |
| `Rotate` | `Revoker` + `Creator` |
| `Logout` / `Revoke` | `Revoker` |
| `PasswordChanged` | `AccountRevoker` + `Revoker` + `Creator` |
| `RevokeAll` | `AccountRevoker` |
| `List` | `Lister` |
| `Purge` | `Purger` |

All methods receive `context.Context`, may be called concurrently, and must be safe for concurrent use. All errors are propagated to the library, which wraps them and denies access (fail closed). Implementations must never log or store the raw credential — they only ever receive the SHA-256 digest in `Session.ID` / the `id` parameter.

## `Creator` — store a new session

```go
type Creator interface {
    Create(ctx context.Context, session *Session) error
}
```

- Persists every exported `Session` field under `Session.ID`.
- Insert-only: an existing `ID` is a duplicate and MUST fail — never upsert (uniqueness, FR-004).
- Treats the `*Session` as a read-only input and must not retain the pointer.
- Errors: duplicate/any storage error.

## `Validator` — fetch a session for validation

```go
type Validator interface {
    Validate(ctx context.Context, id string) (*Session, error)
}
```

- Returns the record for `id`. If absent **or** `RevokedAt` is non-zero, returns `ErrNotFound` (wrapped allowed).
- Expired records MUST be returned — the library owns deadline policy and emits the expiry audit event.
- Returns a fresh value or a value copy; callers may read all fields.
- Errors: `auth.ErrNotFound`; storage error.

## `Toucher` — record activity

```go
type Toucher interface {
    Touch(ctx context.Context, session *Session) error
}
```

- Updates only `LastSeenAt` and `IdleExpiresAt` for `session.ID`.
- MUST NOT change `CreatedAt`, `AbsoluteExpiresAt`, `AccountID`, `Remember`, or `RevokedAt`.
- Treats the `*Session` as a read-only input.
- Errors: `ErrNotFound` if absent; storage error.

## `Revoker` — revoke one session

```go
type Revoker interface {
    Revoke(ctx context.Context, id string) error
}
```

- Marks the session revoked (set `RevokedAt`) or deletes it.
- Idempotent: absent or already-revoked returns `nil`.
- Errors: storage error.

## `AccountRevoker` — revoke an account's sessions in bulk

```go
type AccountRevoker interface {
    RevokeAccount(ctx context.Context, accountID AccountID, except string) ([]*Session, error)
}
```

- Revokes every session of the account **except** `except`, in one atomic operation (single statement or transaction); `except == ""` revokes all. Idempotent.
- Returns the records it revoked, as fresh values, so the library can emit one audit event per session; the return may be empty but must not include sessions it did not revoke.
- Backs `RevokeAll` (FR-014) and `PasswordChanged` (FR-011: all other sessions die, the acting one remains).
- Errors: storage error.

## `Lister` — enumerate an account's sessions

```go
type Lister interface {
    List(ctx context.Context, accountID AccountID) ([]*Session, error)
}
```

- Returns the account's active sessions (`RevokedAt` zero) as fresh values; result order is not significant.
- Never includes revoked/deleted records. The library additionally filters out records past their idle/absolute deadline.
- Errors: storage error.

## `Purger` — housekeeping

```go
type Purger interface {
    Purge(ctx context.Context, now time.Time) (int, error)
}
```

- Deletes exactly the records where `RevokedAt` is non-zero **or** `IdleExpiresAt <= now` **or** `AbsoluteExpiresAt <= now`; returns the number removed.
- Active sessions MUST NOT be touched (FR-018).
- `now` is supplied by the library (configured clock) so cleanup is deterministic in tests.
- This role is separate because its caller (a scheduled server task) and lifetime differ from the request flow; it is the only persistence operation that never runs during an HTTP request.

## Error contract

- Return `auth.ErrNotFound` (wrapped is fine) from `Validate` for absent or revoked sessions.
- Any other error means "storage unavailable": the library logs it and denies the request.
- Never return a record for a revoked id from `Validate`, and never fabricate deadlines.

## Reference SQLite shape (guidance only — app owns migrations/driver)

The project previously used SQLite; this is the suggested column mapping, not shipped code.

```sql
CREATE TABLE IF NOT EXISTS auth_sessions (
    id                  TEXT PRIMARY KEY NOT NULL,          -- base64url(sha256(credential))
    account_id          INTEGER NOT NULL,
    created_at          INTEGER NOT NULL,                   -- unix seconds (UTC)
    last_seen_at        INTEGER NOT NULL,
    idle_expires_at     INTEGER NOT NULL,
    absolute_expires_at INTEGER NOT NULL,
    remember            INTEGER NOT NULL DEFAULT 0,
    revoked_at          INTEGER,                            -- NULL = active
    user_agent          TEXT NOT NULL DEFAULT '',
    address             TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS auth_sessions_account_idx ON auth_sessions(account_id);
CREATE INDEX IF NOT EXISTS auth_sessions_deadline_idx ON auth_sessions(idle_expires_at, absolute_expires_at);
```

Mapping: `Create` → `INSERT` (duplicate PK fails); `Validate` → `SELECT ... WHERE id = ? AND revoked_at IS NULL`; `Touch` → `UPDATE auth_sessions SET last_seen_at = ?, idle_expires_at = ? WHERE id = ?`; `Revoke` → `UPDATE ... SET revoked_at = ? WHERE id = ?`; `List` → `SELECT ... WHERE account_id = ? AND revoked_at IS NULL`; `RevokeAccount` → `UPDATE ... SET revoked_at = ? WHERE account_id = ? AND revoked_at IS NULL AND (? = '' OR id <> ?)` returning the affected rows; `Purge` → `DELETE ... WHERE revoked_at IS NOT NULL OR idle_expires_at <= ? OR absolute_expires_at <= ?`.

## Concurrency, rotation, and multi-instance behavior

- `Validate` + `Touch` + `Revoke` may interleave across instances; the library handles races fail-closed. Rotation is `Revoke(old)` then `Create(new)`, so a store needs per-operation atomicity plus the uniqueness constraint on `id` (delete-before-create guarantees at most one live credential).
- FR-017/SC-005 require all app instances to share one store; any process restart reconnects to the same records. The library is stateless between calls: every function takes the role interfaces explicitly.