# Data Model — 012 HTTP Session-Based Authentication Library

**Branch**: `012-session-auth` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

The library owns three structural concepts (session record, request view, event), configuration options, and seven persistence role interfaces. Implementations of the role interfaces decide the wire/schema format; the library only fixes field semantics and invariants. No password or credential material is ever a field of a persisted value. All behavior lives in small package-level functions, not in methods on these types.

## Session (persisted record — `auth.Session`)

| Field | Type | Meaning | Rule |
|---|---|---|---|
| `ID` | `string` | Lookup key: `base64url(SHA-256(raw credential))` | Never the raw credential; primary key for stores |
| `AccountID` | `AccountID` (`= int64`) | Verified account the session belongs to | Set by the app at `Create`; immutable |
| `CreatedAt` | `time.Time` | Session creation instant | Preserved across `Rotate` |
| `LastSeenAt` | `time.Time` | Last validated request instant | Updated only by `Toucher.Touch` |
| `IdleExpiresAt` | `time.Time` | `LastSeenAt + IdleTimeout` (sliding) | Extended by `Touch`, never by rotation |
| `AbsoluteExpiresAt` | `time.Time` | `CreatedAt + AbsoluteTimeout` (or `+ RememberTimeout`) | Computed once by `Create`; preserved by `Rotate`; **never** modified otherwise |
| `Remember` | `bool` | "Remember me" was requested | Preserved across rotation; drives cookie persistence and absolute timeout |
| `RevokedAt` | `time.Time` | Zero = active; non-zero = revoked | Set by `Revoke`/`RevokeAccount`; validation rejects; `Purge` deletes |
| `UserAgent` | `string` | Client origin metadata for display/audit | Recorded at creation; never used for binding |
| `Address` | `string` | Client network address for display/audit | Recorded at creation; never used for binding |

**Constructed only by `Create`/`Rotate`.** The library generates the credential, stores the digest in `ID`, and fills the timestamps. `Validator.Validate` returns `ErrNotFound` for absent or revoked records.

**State machine**

```text
             Create                        Touch (throttled)            Revoke / RevokeAll
   [none] ─────────────▶ [active] ───────────────────────────▶ [active]
                            │  ▲                                   │
                            │  └── Rotate: Revoke(old) ──┐         │
                            │          Create(new) ─────┘         ▼
                            │                                 [revoked]
              idle/absolute │                                      │
              deadline hit  ▼                                      │
                          [expired] ───── denied; Purge deletes ───┘
```

- `active`: `RevokedAt == zero` and `now < IdleExpiresAt` and `now < AbsoluteExpiresAt`.
- `expired`: record exists but either deadline is `<= now`; `Validate` denies with `ErrExpired` and records `expired`; the record is deleted by `Purge` (no write in the validation path).
- `revoked`: `RevokedAt != zero` (logout, explicit revoke, bulk revoke); validation denies with `ErrNotFound`/`ErrRevoked`; `Purge` deletes.
- `deleted`: removed by `Purge`; `Validate` returns `ErrNotFound`.

**Invariants**

1. `ID` is unique; any published credential digest maps to at most one session.
2. `AbsoluteExpiresAt > CreatedAt`; `IdleExpiresAt >= LastSeenAt`; after creation only `IdleExpiresAt` (on touch) and `RevokedAt` (on revoke) may change.
3. `AccountID` is immutable after creation (`Rotate` preserves it; logging into another account creates a new session).
4. A revoked or deleted session is never returned as valid by the library, regardless of what the store returns.
5. No store snapshot contains a value that can be presented as a session credential (FR-006/SC-004).

## Auth (request view — `auth.Auth`)

| Field | Type | Meaning | Rule |
|---|---|---|---|
| `Session` | `Session` | The validated record | Exported; no raw credential |
| `CSRF` | `string` | Derived synchronizer token for this session | `base64url(HMAC-SHA256(credential, "project-reborn/auth/csrf/v1"))`; safe to render same-origin |
| `credential` | `string` (unexported) | Raw cookie credential for this request | Never persisted; used internally for rotation; redacted by `String()`/`LogValue()` |

`Auth` is produced by `Validate`, `Create`, `Rotate`, and `PasswordChanged`; `Protect` puts `*Auth` in the request context and `FromContext` retrieves it. Rendering a form uses `a.CSRF`; the account is `a.Session.AccountID`.

## Event (audit record — `auth.Event`)

| Field | Type | Meaning | Rule |
|---|---|---|---|
| `At` | `time.Time` | Event instant | Library clock (`WithClock`) |
| `Kind` | `EventKind` string | `created`, `rotated`, `revoked`, `logged_out`, `expired` | One of the five constants |
| `AccountID` | `AccountID` | Account the session belongs to | Always present when known |
| `SessionID` | `string` | Session digest (`Session.ID`) | Never the raw credential |
| `Outcome` | `Outcome` string | `ok` or `denied` | `denied` only for `expired` detection; the rest are `ok` |
| `Address` | `string` | Client network address | From the request; may be empty |
| `UserAgent` | `string` | Client user agent | From the request; may be empty |

**Validation rule (FR-013)**: no password, secret, hash preimage, or raw session credential may appear in any field. `SessionID` is the digest, which cannot be replayed.

## Persistence roles (one method each)

| Interface | Method | Responsibility |
|---|---|---|
| `Creator` | `Create(ctx, *Session) error` | Store a new session record (insert-only, no upsert) |
| `Validator` | `Validate(ctx, id) (*Session, error)` | Fetch the record for a digest; `ErrNotFound` if absent/revoked |
| `Toucher` | `Touch(ctx, *Session) error` | Record activity (`LastSeenAt`, `IdleExpiresAt`) only |
| `Revoker` | `Revoke(ctx, id) error` | Revoke one session; idempotent |
| `AccountRevoker` | `RevokeAccount(ctx, accountID, except) ([]*Session, error)` | Atomically revoke every account session except one; returns what was revoked |
| `Lister` | `List(ctx, accountID) ([]*Session, error)` | Enumerate the account's active sessions |
| `Purger` | `Purge(ctx, now) (int, error)` | Delete revoked and past-deadline records |

A concrete store typically implements all seven roles; each library function receives only the roles it uses, once per capability.

## Options and secure defaults (`auth.Option`)

Every function applies these defaults first; options are optional by construction (D2/D17).

| Option | Default | Purpose |
|---|---|---|
| `WithCookieName(string)` | `__Host-session` | Cookie name; `__Host-` rules validated |
| `WithCookiePath(string)` | `/` | Cookie path |
| `WithCookieDomain(string)` | `""` | Cookie domain (empty = host-only) |
| `WithSameSite(http.SameSite)` | `http.SameSiteStrictMode` | Cookie SameSite mode |
| `WithCookieSecure(bool)` | `true` | Set the cookie `Secure` attribute (cookie hardening; transport itself is deployment-owned per spec C3) |
| `WithIdleTimeout(time.Duration)` | `30m` | Sliding inactivity window |
| `WithAbsoluteTimeout(time.Duration)` | `12h` | Hard session lifetime |
| `WithRememberTimeout(time.Duration)` | `30 * 24h` | Hard lifetime + cookie max-age for "remember me" |
| `WithRemember(bool)` | `false` | `Create` marks the session "remember me": persistent cookie + remember absolute deadline |
| `WithTouchInterval(time.Duration)` | `1m` | Minimum spacing between activity writes |
| `WithTokenBytes(int)` | `32` | Credential entropy; minimum 16 (128 bits) |
| `WithCSRFHeader(string)` | `X-CSRF-Token` | Accepted anti-forgery header |
| `WithCSRFParam(string)` | `csrf_token` | Accepted anti-forgery form field |
| `WithClock(func() time.Time)` | `time.Now` | Clock seam for deterministic tests |
| `WithEventSink(EventSink)` | structured `slog.Default()` sink | Audit destination |
| `WithUnauthorizedHandler(http.Handler)` | generic `401` | Authentication denial response |
| `WithForbiddenHandler(http.Handler)` | generic `403` | CSRF denial response |

Validation (performed before use, all functions): cookie name non-empty; a `__Host-` name requires `Path == "/"`, no domain, and `Secure == true` (`WithCookieSecure(true)`) — so `WithCookieSecure(false)` requires a non-`__Host-` cookie name; timeouts positive; `TokenBytes >= 16`; `TouchInterval` positive and `<= IdleTimeout`. On read, cookie values longer than 128 bytes are rejected as malformed. Invalid configuration yields an error; no request is processed.

## Relationships

- **Account (external) 1 ── * Session**: the app owns the account; sessions reference it by `AccountID` and are never created without an app call to `Create` (FR-001).
- **Session 1 ── * Event**: every lifecycle action on a session produces one event carrying the session digest.
- **Session 1 ── 1 CSRF secret**: derived from the raw credential, so rotation rotates the anti-forgery value without a stored field.
- **Function → role interfaces**: `Create`/`Rotate` use `Revoker` + `Creator`; `Validate`/`Protect` use `Validator` + `Toucher`; `Logout`/`Revoke` use `Revoker`; `PasswordChanged` uses `AccountRevoker` + `Revoker` + `Creator`; `RevokeAll` uses `AccountRevoker`; `List` uses `Lister`; `Purge` uses `Purger`.