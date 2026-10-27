# Persistence Contract: CMS Web Application

**Feature**: `014-cms-web-app` | **Date**: 2026-09-16

The CMS consumes the generated operations on `*store.Store` directly. The
store instance is the one process store, obtained through `store.Must()`
(`013-store-library` addendum); `router.New` receives it as a required
parameter, and tests open isolated stores with `store.Open` on temporary
files.

## Operations consumed

| Slice | Operation | Cardinality | Called from | Inputs | Effect |
|---|---|---|---|---|---|
| 1 | `GetUserByUsername` | `:one` | sign-in verify | canonical username | credential hash lookup; `sql.ErrNoRows` = credential failure (the dummy bcrypt comparison still runs) |
| 1 | `MarkUserSignedIn` | `:exec` | sign-in success | now, user id | sets `last_signed_in_at` |
| 1 | `CreateSession` | `:exec` | sign-in success | digest, user id, created/last-seen/idle/absolute timestamps, remember flag, revoked 0, user agent, address | inserts one active session |
| 1 | `GetSession` | `:one` | `Guard` | digest | session row |
| 1 | `TouchSession` | `:exec` | `Guard` idle refresh | new last-seen, new idle expiry, digest | updates activity columns only |
| 1 | `PurgeSessions` | `:execrows` | lazy purge in handlers | — | deletes revoked and past-deadline rows; returns the count |
| 1 | `GetLoginAttempt` | `:one` | throttle check | canonical username | failures and lock; `sql.ErrNoRows` = no history |
| 1 | `UpsertLoginFailure` | `:exec` | failure path | canonical username, window start, now | window-aware increment (restarts when the anchor is older than the window) |
| 1 | `LockLoginAttempt` | `:exec` | failure path at the limit | lock expiry, canonical username | sets `locked_until` |
| 1 | `ClearLoginAttempt` | `:exec` | success path | canonical username | removes the key |
| 2 | `CreateUser` | `:execlastid` | registration | profile, hash, timestamps | account insert; unique conflicts map to field errors |
| 2 | `GetUserByID` | `:one` | member pages | id | session identity and personal page |
| 2 | `UpdateUserMotto` | `:exec` | motto action | motto, id | saves the motto |
| 2 | `RevokeSession` | `:exec` | sign-out | revocation time, digest | sets `revoked_at` where it is 0 |
| 3 | `GetUserByEmail` | `:one` | recovery request | canonical email | account match |
| 3 | `UpdateUserPassword` | `:exec` | reset action | new hash, id | password change |
| 3 | `ListUserSessions` / `RevokeSession` | `:many` / `:exec` | reset action | user id / time, digest | revokes every session after a password change |
| 3 | recovery-token operations | — | recovery | token digest, user id, timestamps | issue, validate, use, delete previous |

## Operation change for Slice 1

`PurgeSessions` becomes parameterless: the SQL deletes rows with
`revoked_at != 0` or either deadline at or before the database clock, so
callers do not pass cutoffs they would always set to `now`. The workflow:

1. Edit `packages/store/queries/sessions.query.sql` to drop the cutoff
   parameters.
2. Run `go tool sqlc generate` from `packages/store` and commit the updated
   `sessions.query.sql.go`.
3. Update `packages/store/knowledge/queries/sessions.md` (inputs, effect, and
   consumer wording) and the consumer wording in
   `packages/store/knowledge/schemas/sessions.md`, naming the CMS handlers as
   the consumers.

## Conventions applied

- Timestamps are unix seconds, aligned with the store schema.
- The canonical username (lower-cased, trimmed) is the single lookup and
  throttle key; display columns are never used for lookup.
- The raw session token exists only in the cookie and the temporary
  `Set-Cookie` header; the database stores the SHA-256 digest.
- Handlers never write ad-hoc SQL; every statement is a generated store
  operation (constitution IV, `013-store-library`).
- Session deadlines (30 min idle, 12 h absolute, 30 d remember) are named
  constants in `internal/router/session.go`, matching `012-session-auth` D9.

## Gates

From `packages/store`: `go vet ./...` and `go test ./...` pass,
`make check-docs` exits 0, and `go tool sqlc generate` leaves a clean
`git diff --exit-code`. From `packages/cms`: handler and session tests pass
against a temporary store file.