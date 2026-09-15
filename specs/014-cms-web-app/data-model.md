# Data Model: CMS Web Application

**Feature**: `014-cms-web-app` | **Date**: 2026-09-12

Phase 1 output. All structures below are declared in the shared store following the `adding-data-persistence` skill: additive idempotent DDL, `snake_case` plural tables, unix seconds UTC in `INTEGER` columns, booleans as `INTEGER` 0/1, `TEXT` UTF-8, foreign keys `<referenced_table_singular>_id`, indexes `idx_<table>_<columns>`, and every file documented under `packages/store/knowledge/` with the `documenting-with-okf` skill.

**File families are named after their domain, never after the package or feature that introduces them** (user direction 2026-09-12). A family may hold one or many tables, all related to its name, so future developers can find and reuse the data by domain. Multi-word families are lowercase kebab-case.

| Family | Schema file | Query file | Tables | Consumers |
|---|---|---|---|---|
| `users` | `schema/users.schema.sql` | `queries/users.query.sql` | `users` | CMS today; the future game server reuses the same users |
| `sessions` | `schema/sessions.schema.sql` | `queries/sessions.query.sql` | `sessions` | Every HTTP application through the `packages/auth` contracts |
| `recovery-tokens` | `schema/recovery-tokens.schema.sql` | `queries/recovery-tokens.query.sql` | `recovery_tokens` | CMS password recovery |
| `login-attempts` | `schema/login-attempts.schema.sql` | `queries/login-attempts.query.sql` | `login_attempts` | CMS sign-in and recovery throttling |

Schemas apply in lexicographic filename order (`login-attempts`, `recovery-tokens`, `sessions`, `users`); SQLite resolves foreign keys at execution time, so tables referencing `users` are safe to declare before it.

---

## Entity: User

The member identity shared by the CMS and, later, the game client (spec Key Entity "Account"). The spec Key Entity "Profile" (avatar appearance and motto) is represented by this table's `avatar` and `motto` columns.

**Table `users`**

| Column | Type | Rules | Notes |
|---|---|---|---|
| `id` | INTEGER | PK | User identifier; `auth.AccountID` maps to it |
| `username` | TEXT | NOT NULL | Display form as registered |
| `username_canonical` | TEXT | NOT NULL UNIQUE | Lower-cased; availability and sign-in lookup |
| `password_hash` | TEXT | NOT NULL | bcrypt hash; never a clear password (FR-012) |
| `email` | TEXT | NOT NULL | Display form |
| `email_canonical` | TEXT | NOT NULL UNIQUE | Lower-cased; duplicate detection and recovery match |
| `birth_date` | INTEGER | NOT NULL | Unix seconds at 00:00 UTC |
| `avatar` | TEXT | NOT NULL | `female` or `male` (FR-005) |
| `motto` | TEXT | NOT NULL DEFAULT '' | Editable in place (FR-027) |
| `newsletter` | INTEGER | NOT NULL DEFAULT 0 | 0/1; recorded consent (FR-010) |
| `terms_accepted_at` | INTEGER | NOT NULL | Unix seconds; recorded acceptance (FR-010) |
| `is_admin` | INTEGER | NOT NULL DEFAULT 0 | 0/1; assigned outside the CMS (spec assumption) |
| `created_at` | INTEGER | NOT NULL | Unix seconds |
| `last_signed_in_at` | INTEGER | NOT NULL DEFAULT 0 | 0 = never; shown on the personal page (FR-026) |

**Validation rules** (enforced in `internal/account`, messages name the failing field, FR-008):

| Field | Rule |
|---|---|
| Username | 3–15 characters, `[A-Za-z0-9_-]` only; unique under canonicalization |
| Password | 8–72 bytes (bcrypt input limit); confirmation must match |
| Birth date | `birth_day`/`birth_month`/`birth_year` selects form a real date, not in the future, year ≥ 1900 |
| Email | Valid address (`net/mail`), ≤ 254 characters; unique under canonicalization; confirmation must match |
| Terms | Must be accepted |
| Avatar | `female` or `male` |
| Newsletter | Optional 0/1 |
| Motto | Trimmed, ≤ 128 characters, no control characters |

**Relationships**: one user has many sessions and many recovery tokens.

**Lifecycle**: created on registration (FR-009) → `last_signed_in_at` updated on each successful sign-in → `password_hash` updated by the reset flow.

---

## Entity: Session

The authenticated visit (spec Key Entity "Session"), owned by the session-authentication contracts; the CMS persists it through the `authstore` adapter (research R1).

**Table `sessions`**

| Column | Type | Rules | Maps to `auth.Session` |
|---|---|---|---|
| `id` | TEXT | PK | `ID` — SHA-256 digest; raw credential is never stored |
| `user_id` | INTEGER | NOT NULL, FK → `users(id)` ON DELETE CASCADE | `AccountID` |
| `created_at` | INTEGER | NOT NULL | `CreatedAt` |
| `last_seen_at` | INTEGER | NOT NULL | `LastSeenAt` |
| `idle_expires_at` | INTEGER | NOT NULL | `IdleExpiresAt` |
| `absolute_expires_at` | INTEGER | NOT NULL | `AbsoluteExpiresAt` |
| `remember` | INTEGER | NOT NULL | `Remember` |
| `revoked_at` | INTEGER | NOT NULL DEFAULT 0 | `RevokedAt` (0 = active) |
| `user_agent` | TEXT | NOT NULL DEFAULT '' | `UserAgent` |
| `address` | TEXT | NOT NULL DEFAULT '' | `Address` |

**Indexes**: `idx_sessions_user_id`, `idx_sessions_absolute_expires_at` (purge scan).

**State transitions**: created → active → (revoked | idle-expired | absolute-expired) → purged. The library enforces deadlines; the adapter only persists.

---

## Entity: Recovery request / token

This feature's only new security artifact (spec Key Entity "Recovery request", FR-017–FR-021).

**Table `recovery_tokens`**

| Column | Type | Rules |
|---|---|---|
| `id` | INTEGER | PK |
| `user_id` | INTEGER | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `token_digest` | TEXT | NOT NULL UNIQUE — SHA-256 digest of the emailed token; the raw token exists only in the email |
| `created_at` | INTEGER | NOT NULL |
| `expires_at` | INTEGER | NOT NULL — 30 minutes after creation |
| `used_at` | INTEGER | NOT NULL DEFAULT 0 — 0 = unused; single use |

**Index**: `idx_recovery_tokens_user_id`.

**State transitions**: issued → (used | expired). A new request deletes the user's previous tokens before inserting one (only the newest link is ever valid).

**Neutrality**: a request that matches no user creates no token and sends no mail, yet returns the same confirmation (FR-019, FR-021).

---

## Entity: Login attempt

Failed attempt counters behind FR-013 / SC-010 and recovery throttling (FR-020).

**Table `login_attempts`**

| Column | Type | Rules |
|---|---|---|
| `key` | TEXT | PK — namespaced: `u:<canonical-username>`, `ip:<remote-address>`, `r:<canonical-username>` |
| `failures` | INTEGER | NOT NULL DEFAULT 0 — consecutive failures in the current window |
| `locked_until` | INTEGER | NOT NULL DEFAULT 0 — 0 = not locked |
| `updated_at` | INTEGER | NOT NULL — last failure |

**State transitions**: absent → accumulating (window 15 min, max 5) → locked (15 min). Increment resets `failures` to 1 when `updated_at` is older than the window. A successful sign-in deletes the account key; the address key expires through its own window/lock. When locked, the member sees the throttle message; the sign-in error is always generic (no account confirmation).

---

## Store operations

### `packages/store/queries/users.query.sql`

| Operation | Cardinality | Purpose |
|---|---|---|
| `CreateUser` | `:execlastid` | Registration insert, returns new id |
| `GetUserByID` | `:one` | Personal page, session identity |
| `GetUserByUsername` | `:one` | Availability, sign-in lookup (canonical param) |
| `GetUserByEmail` | `:one` | Duplicate-email check, recovery match (canonical param) |
| `UpdateUserMotto` | `:exec` | Motto change |
| `UpdateUserPassword` | `:exec` | Reset flow |
| `MarkUserSignedIn` | `:exec` | `last_signed_in_at` update |

### `packages/store/queries/sessions.query.sql`

| Operation | Cardinality | Purpose |
|---|---|---|
| `CreateSession` | `:exec` | Insert-only session record |
| `GetSession` | `:one` | Digest lookup |
| `TouchSession` | `:exec` | Update `last_seen_at`, `idle_expires_at` only |
| `RevokeSession` | `:exec` | Set `revoked_at` where currently 0 (idempotent) |
| `ListUserSessions` | `:many` | Ordered by `created_at DESC` |
| `PurgeSessions` | `:execrows` | Delete revoked or past-deadline rows; returns count |

### `packages/store/queries/recovery-tokens.query.sql`

| Operation | Cardinality | Purpose |
|---|---|---|
| `CreateRecoveryToken` | `:exec` | Issue a reset token digest |
| `GetRecoveryToken` | `:one` | Validate the reset link |
| `UseRecoveryToken` | `:exec` | Mark single use |
| `DeleteUserRecoveryTokens` | `:exec` | Invalidate previous links on a new request |

### `packages/store/queries/login-attempts.query.sql`

| Operation | Cardinality | Purpose |
|---|---|---|
| `UpsertLoginFailure` | `:exec` | Increment with window reset |
| `GetLoginAttempt` | `:one` | Read failures/lock |
| `LockLoginAttempt` | `:exec` | Set `locked_until` |
| `ClearLoginAttempt` | `:exec` | Remove a key after success |

### Auth adapter mapping (`packages/cms/internal/authstore`)

| `auth` interface | Adapter behaviour |
|---|---|
| `Creator.Create` | `CreateSession`; a duplicate digest surfaces as an error (fail closed) |
| `Validator.Validate` | `GetSession`; missing row → `auth.ErrNotFound`; revoked rows are returned so the library emits the right denial |
| `Toucher.Touch` | `TouchSession` with the session's `LastSeenAt` and `IdleExpiresAt` |
| `Revoker.Revoke` | `RevokeSession`; absent/already-revoked → nil |
| `AccountRevoker.RevokeAccount` | Inside `store.Begin`: list the user's sessions, revoke each active one except the survivor, return the revoked records; rollback on error |
| `Lister.List` | `ListUserSessions` (the library filters deadlines and revoked rows) |
| `Purger.Purge` | `PurgeSessions(now)`; returns rows removed |

`auth.AccountID` maps to `users.id` and `sessions.user_id`. Conversions: unix seconds ↔ `time.Time` (UTC), 0/1 ↔ `bool`. Errors are classified with `store.IsNotFound`, `store.IsConflict`, `store.IsForeignKey`, `store.IsBusy` (adding-data-persistence skill); the adapter translates absence into `auth.ErrNotFound` where the contract requires it.

---

## Deferred entities (explicitly out of scope)

Tags, messages, friends, groups, rooms, in-game events, news, credits, and club membership are named by the deferred features (spec "Out of Scope") and MUST NOT be created by this feature. The `recovery_tokens` and `login_attempts` tables are the only structures this feature introduces besides `users` and `sessions`.

## OKF documentation set

One concept per schema file and per query file, listed in the directory indexes:

| Concept | Location |
|---|---|
| `users.schema.sql` | `packages/store/knowledge/schemas/users.md` |
| `sessions.schema.sql` | `packages/store/knowledge/schemas/sessions.md` |
| `recovery-tokens.schema.sql` | `packages/store/knowledge/schemas/recovery-tokens.md` |
| `login-attempts.schema.sql` | `packages/store/knowledge/schemas/login-attempts.md` |
| `users.query.sql` | `packages/store/knowledge/queries/users.md` |
| `sessions.query.sql` | `packages/store/knowledge/queries/sessions.md` |
| `recovery-tokens.query.sql` | `packages/store/knowledge/queries/recovery-tokens.md` |
| `login-attempts.query.sql` | `packages/store/knowledge/queries/login-attempts.md` |

`make check-docs` must exit 0.
