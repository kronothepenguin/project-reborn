# Data Model: CMS Web Application

**Feature**: `014-cms-web-app` | **Date**: 2026-09-16

All structures live in the shared store following the `adding-data-persistence`
skill: additive idempotent DDL, `snake_case` plural tables, unix seconds UTC
in `INTEGER` columns, booleans as `INTEGER` 0/1, `TEXT` UTF-8, foreign keys
`<referenced_table_singular>_id`, indexes `idx_<table>_<columns>`, and one OKF
concept per schema and query file under `packages/store/knowledge/`. Families
are named after their domain, never after the package that introduces them.

| Family | Tables | Slices |
|---|---|---|
| `users` | `users` | 1 (read + last sign-in), 2 (registration, motto) |
| `sessions` | `sessions` | 1 |
| `login-attempts` | `login_attempts` | 1 |
| `recovery-tokens` | `recovery_tokens` | 3 |

Slice 1 changes one operation: `PurgeSessions` becomes parameterless (the
statement compares deadlines against the database clock), regenerated with
`go tool sqlc generate` and re-documented in the bundle.

## Entity: User (`users`)

The member identity shared by the CMS and, later, the game client.

| Column | Type | Rules | Slice |
|---|---|---|---|
| `id` | INTEGER | PK | 1 |
| `username` | TEXT | NOT NULL, display form | 2 |
| `username_canonical` | TEXT | NOT NULL UNIQUE, lower-cased lookup | 1 |
| `password_hash` | TEXT | NOT NULL, bcrypt; never a clear password | 1 |
| `email` | TEXT | NOT NULL, display form | 2 |
| `email_canonical` | TEXT | NOT NULL UNIQUE, lower-cased lookup | 2 |
| `birth_date` | INTEGER | NOT NULL, unix seconds at 00:00 UTC | 2 |
| `avatar` | TEXT | NOT NULL, `female` or `male` | 2 |
| `motto` | TEXT | NOT NULL DEFAULT `''`, ≤ 128 characters, no control characters | 2 |
| `newsletter` | INTEGER | NOT NULL DEFAULT 0, 0/1 consent | 2 |
| `terms_accepted_at` | INTEGER | NOT NULL, unix seconds | 2 |
| `is_admin` | INTEGER | NOT NULL DEFAULT 0, assigned outside the CMS | 2 |
| `created_at` | INTEGER | NOT NULL, unix seconds | 2 |
| `last_signed_in_at` | INTEGER | NOT NULL DEFAULT 0, 0 = never | 1 |

**Slice 1 reads**: `username_canonical` (lookup), `password_hash`
(comparison), `id` (session owner). **Slice 1 writes**:
`last_signed_in_at` (`MarkUserSignedIn`).

Rules: unknown username and wrong password yield the same message; an unknown
username still runs a bcrypt comparison against a fixed dummy hash so timing
reveals nothing. No field is ever rendered except the page data below.

**Slice 2 validation** (registration, messages name the failing field):
username 3–15 of `[A-Za-z0-9_-]`, unique under canonicalization; password
8–72 bytes with matching confirmation; a real birth date not in the future
and year ≥ 1900; valid email ≤ 254 characters, unique under canonicalization,
with matching confirmation; terms accepted; avatar `female` or `male`;
newsletter optional. Password fields are never re-rendered.

## Entity: Session (`sessions`)

One row per authenticated visit; created by the sign-in action, validated by
`Guard`, removed by the lazy purge.

| Column | Type | Rules |
|---|---|---|
| `id` | TEXT | PK, SHA-256 hex digest of the raw cookie token; the raw token is never stored |
| `user_id` | INTEGER | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `created_at` | INTEGER | NOT NULL, unix seconds |
| `last_seen_at` | INTEGER | NOT NULL, unix seconds |
| `idle_expires_at` | INTEGER | NOT NULL, now + 30 min at creation/refresh |
| `absolute_expires_at` | INTEGER | NOT NULL, now + 12 h (now + 30 d with remember) |
| `remember` | INTEGER | NOT NULL, 0/1 |
| `revoked_at` | INTEGER | NOT NULL DEFAULT 0, 0 = active |
| `user_agent` | TEXT | NOT NULL DEFAULT `''` |
| `address` | TEXT | NOT NULL DEFAULT `''` |

Indexes: `idx_sessions_user_id`, `idx_sessions_absolute_expires_at`.

State transitions: created → active; active → idle-expired (refreshable) |
absolute-expired (terminal) | revoked (terminal); expired and revoked rows are
deleted by the parameterless `PurgeSessions` on sign-in attempts and guarded
requests. `Guard` refreshes only the idle case by writing a new `last_seen_at`
and `idle_expires_at`.

## Entity: Login attempt (`login_attempts`)

Throttle state behind the spec's default policy (5 failures / 15 min window /
15 min lock).

| Column | Type | Rules |
|---|---|---|
| `attempt_key` | TEXT | PK, the canonical username |
| `failures` | INTEGER | NOT NULL DEFAULT 0, consecutive failures in the current window |
| `locked_until` | INTEGER | NOT NULL DEFAULT 0, 0 = not locked |
| `updated_at` | INTEGER | NOT NULL, unix seconds, window anchor |

Transitions: absent → accumulating (the increment restarts `failures` at 1 when
`updated_at` is older than the window) → locked; a successful verification
deletes the key. A lock is checked before credential verification and always
renders the generic throttle message.

## Entity: Recovery token (`recovery_tokens`, Slice 3)

| Column | Type | Rules |
|---|---|---|
| `id` | INTEGER | PK |
| `user_id` | INTEGER | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `token_digest` | TEXT | NOT NULL UNIQUE, SHA-256 digest; the raw token exists only in the email |
| `created_at` | INTEGER | NOT NULL |
| `expires_at` | INTEGER | NOT NULL, 30 minutes after creation |
| `used_at` | INTEGER | NOT NULL DEFAULT 0, single use |

Index: `idx_recovery_tokens_user_id`. Transitions: issued → used | expired; a
new request deletes the user's previous tokens before inserting the new one.

## CSRF nonce (cookie + form value, no table)

| Item | Value |
|---|---|
| Cookie `__Host-csrf` | 32 random bytes, base64url; `Path=/`, `HttpOnly`, `Secure`, `SameSite=Strict`, session cookie |
| Hidden input `csrf_token` | the same value, rendered through `[[ .CSRFToken ]]` |
| Issued | on `GET /{$}` when the cookie is absent, and on a failed nonce check |
| Checked | on `POST /{$}` before any credential or throttle work, constant-time compare |

## Page data model

Runtime template data for the index view (`indexPage`), consumed by
`index.astro` through `signed-out.astro`:

| Field | Type | Value |
|---|---|---|
| `CSRFToken` | string | current nonce |
| `Values.Username` | string | submitted username on failure; empty on GET |
| `Errors.Username` | string | "Enter your username." |
| `Errors.Password` | string | "Enter your password." |
| `Errors.General` | string | throttle, credential, nonce, or unavailable message |

The signed-out header (offline state, zero online count) and footer routes are
static markup. Slice 2 adds the personal-page data (username, motto, avatar,
last sign-in, admin flag) and its layout data; Slice 3 adds the forgot/reset
views' data (`Submitted`, token state, per-field errors).

## Store operations consumed

| Operation | Cardinality | Slice | Purpose |
|---|---|---|---|
| `GetUserByUsername` | `:one` | 1 | canonical lookup for sign-in |
| `MarkUserSignedIn` | `:exec` | 1 | `last_signed_in_at` update |
| `CreateSession` | `:exec` | 1 | insert-only session record |
| `GetSession` | `:one` | 1 | digest lookup in `Guard` |
| `TouchSession` | `:exec` | 1 | idle refresh (`last_seen_at`, `idle_expires_at`) |
| `RevokeSession` | `:exec` | 2 | sign-out, password-change revocation |
| `PurgeSessions` | `:execrows` | 1 | parameterless delete of revoked/expired rows |
| `GetLoginAttempt` | `:one` | 1 | read failures and lock |
| `UpsertLoginFailure` | `:exec` | 1 | window-aware increment |
| `LockLoginAttempt` | `:exec` | 1 | set `locked_until` |
| `ClearLoginAttempt` | `:exec` | 1 | remove the key after success |
| `CreateUser` | `:execlastid` | 2 | registration insert |
| `GetUserByID` | `:one` | 2 | session identity on member pages |
| `UpdateUserMotto` | `:exec` | 2 | motto change |
| `GetUserByEmail` | `:one` | 3 | recovery match |
| `UpdateUserPassword` | `:exec` | 3 | reset completion |
| `ListUserSessions` / `RevokeSession` | `:many`/`:exec` | 3 | revoke all sessions on password change |
| recovery-token operations | — | 3 | issue, validate, use, delete |

Handlers never write ad-hoc SQL; every statement is a generated store
operation (constitution IV, `013-store-library`). Passwords and tokens are
never rendered, logged, or stored in clear.