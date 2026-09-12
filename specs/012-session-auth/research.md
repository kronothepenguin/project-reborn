# Research — 012 HTTP Session-Based Authentication Library

**Branch**: `012-session-auth` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

All `NEEDS CLARIFICATION` items are resolved. Sources: feature spec (FR-001…FR-019, US1–US5, edge cases, SC-001…SC-006), OWASP Session Management / CSRF Prevention guidance referenced by the spec, the constitution (stdlib, KISS/YAGNI/SOLID), and the user clarification interviews below.

## User clarifications (recorded)

- **C1 (spec)** — session layer only: the app verifies credentials; the library starts after that. Reconfirmed during planning: `Create` is the post-verification call and no password ever enters the library.
- **C2 (spec)** — CSRF protection is included.
- **C3 (spec)** — transport security (TLS) is deployment-owned: the library does not require, enforce, or inspect transport; FR-003 is removed and FR-005 no longer requires secure transport.
- **Planning Q1 — store shape** (user): "create, validate, revoke sounds better than set, get, delete. purge is a different stuff than the normal http flow, so it is a different interface… recall SOLID."
- **Planning Q2 — persistence shipping** (user): "only interface, if you need memory for tests, implement it there, sql is app domain, not library responsibility."
- **Planning Q3 — CSRF transport** (user): synchronizer token.
- **Planning Q4 — API style** (user): "avoid big struct with tons of receivers… a closure with self-contained config that returns a reusable middleware… little functions that do specific one thing."
- **Planning Q5 — required vs optional** (user): "if something is required then make it required, if something is optional it goes to options, for config stuff you can always apply defaults."
- **Planning Q6 — interface granularity** (user): interfaces stay split by responsibility; no merged/fat store; one capability per interface.
- **Planning Q7 — cookie `Secure` attribute** (user): keep it as cookie hardening, renamed `WithCookieSecure` (default `true`); no server-side plaintext check. (User: "Rename option to WithCookieSecure".)

## R1 — Functional API with required capabilities as parameters (user direction; KISS/SRP/DIP)

- **Decision**: package-level functions only. Each takes `w`/`r` (request carries the context) or an explicit `context.Context`, the subject values, the required capability interfaces, then `opts ...Option`. No exported manager struct; `Session` and `Auth` are plain data types. `Protect(validator, toucher, opts...)` resolves configuration once and returns `func(http.Handler) http.Handler`.
- **Rationale**: a function declares exactly the persistence capabilities it uses; a concrete store implementing all role interfaces is passed once per capability, and no operation can reach capabilities it was not given. `Protect` as a closure makes configuration self-contained and the middleware reusable.
- **Alternatives considered**: a `Sessions`/`Manager` struct with methods (rejected by the user); a single fat `Store` interface (rejected by the user — hides which operations a function performs and violates ISP); a `Config` builder value (granular options apply defaults more cleanly, especially for booleans such as `Secure=false`).

## R2 — Credential generation and at-rest protection (FR-004, FR-006, SC-004)

- **Decision**: 32 random bytes (`crypto/rand.Read`) by default, configurable down to a 16-byte hard minimum (128 bits) via `WithTokenBytes` (FR-016); `base64.RawURLEncoding` for the cookie value; persist only `base64url(SHA-256(credential))` as `Session.ID` and as the `id` passed to stores. Lookup by digest is O(1) with a primary-key index.
- **Rationale**: SHA-256 is a standard one-way digest; a captured snapshot cannot be replayed (SC-004).
- **Alternatives considered**: `crypto/rand.Text()` (Go ≥1.24, exactly 128 bits, simple but not configurable); UUID v4 (122 random bits, no stdlib in older Go); bcrypt/argon2 overkill and preclude indexed lookup; HMAC with a server key adds key management for no benefit given 256-bit random input.

## R3 — CSRF: derived synchronizer token (FR-012, US4)

- **Decision**: `Auth.CSRF = base64url(HMAC-SHA256(key = raw credential, message = "project-reborn/auth/csrf/v1"))`. `CheckCSRF(r, a, opts...)` reads `WithCSRFHeader` (default `X-CSRF-Token`) or `WithCSRFParam` (default `csrf_token`) and compares with `crypto/subtle.ConstantTimeCompare`; `Protect` runs it on POST/PUT/PATCH/DELETE. No cookie, no storage field, no extra secret; it rotates with the credential.
- **Rationale**: stateful server-side sessions make the synchronizer pattern the OWASP-preferred choice; deriving it binds it to the session at zero storage cost and cross-origin code cannot read it (SOP).
- **Alternatives considered**: double-submit cookie (chosen against by the user; script-readable, weaker with XSS); random stored CSRF token (extra column; must be hashed at rest, then cannot be re-rendered without a second secret); Go 1.25 `http.NewCrossOriginProtection` (origin/`Sec-Fetch-Site` based; complementary future defense-in-depth, not built — YAGNI).

## R4 — Persistence: seven single-method interfaces, one per responsibility (user direction; ISP/DIP)

- **Decision**:
  - `Creator.Create(ctx, *Session) error` — insert-only.
  - `Validator.Validate(ctx, id) (*Session, error)` — fetch by digest; `ErrNotFound` when absent/revoked.
  - `Toucher.Touch(ctx, *Session) error` — activity write only.
  - `Revoker.Revoke(ctx, id) error` — revoke one, idempotent.
  - `AccountRevoker.RevokeAccount(ctx, accountID, except) ([]*Session, error)` — atomic bulk revoke reporting what it revoked.
  - `Lister.List(ctx, accountID) ([]*Session, error)` — active sessions of an account.
  - `Purger.Purge(ctx, now) (int, error)` — delete revoked/expired records.
- **Rationale**: each interface has one reason to change and one caller story. Functions request exactly the capabilities they invoke (e.g. `Create` needs `Revoker` + `Creator`; `Validate` needs `Validator` + `Toucher`), so the dependency surface is explicit and test doubles are minimal. A concrete store implements all seven; tests provide in-memory per-role implementations.
- **Alternatives considered**: one fat `Store` (rejected by the user); a three-way split `Store`/`Admin`/`Purger` (too coarse — `Validate` vs `Touch` vs `Revoke` vs `List` are distinct responsibilities); two-method role interfaces (`Validate`+`Touch`, `Revoke`+`RevokeAccount`) rejected because the callers differ and ISP favors one method per capability.

## R5 — Session/Auth split and secret redaction (FR-006, FR-013, SC-004)

- **Decision**: `Session` is the persisted record (no secret, exported fields). `Auth` is the request view: `Session Session`, `CSRF string`, plus an unexported credential used internally for rotation/CSRF derivation; `String()`/`LogValue()` redact the credential so logs and `%v` cannot leak it. `Protect` stores `*Auth` in the context; `NewContext`/`FromContext` expose it.
- **Rationale**: makes "raw credential never written by stores or logs" a type-level guarantee; audit/event records reference the digest only. Plain exported fields keep the data types free of receivers, per the user's direction.
- **Alternatives considered**: one `Session` type carrying the credential (stores could copy it; `%+v` prints unexported fields via reflection).

## R6 — Cookie hardening (FR-005; transport is deployment-owned, spec C3)

- **Decision**: defaults `__Host-session`, `Path=/`, no `Domain`, `HttpOnly`, `Secure` (`WithCookieSecure`, default `true`), `SameSite=Strict`; `Max-Age`/`Expires` only when "remember me" is requested. The library performs no transport inspection: it never rejects plaintext requests, and `X-Forwarded-Proto`/`Sec-Fetch-*` are irrelevant.
- **Rationale**: `__Host-` prevents subdomain cookie injection and requires `Secure`; `SameSite=Strict` matches US2 "not attached to cross-site requests"; `HttpOnly` blocks script access; `Secure` is browser-side cookie hardening and stays in scope while TLS enforcement is the deployment's responsibility (spec C3). `__Host-` validity (which requires `Secure`) is enforced before any cookie is written.
- **Alternatives considered**: dropping `Secure`/`__Host-` to decouple from transport entirely (rejected by the user: weakens OWASP cookie hardening); `SameSite=Lax` (configurable via `WithSameSite`); trusting `X-Forwarded-Proto` (moot — no transport checks exist).

## R7 — Timeouts, activity tracking, and replacement vs rotation (FR-008, FR-009, FR-002, US2.3)

- **Decision**: idle 30 m (sliding, `Touch` at most once per `WithTouchInterval`, default 1 m), absolute 12 h, remember-me absolute 30 d. Absolute deadlines are computed once and never rewritten. `Create` revokes any credential the client presents (idempotent) and creates a fresh record; `Rotate` preserves `AccountID`/`CreatedAt`/`AbsoluteExpiresAt`/`Remember` from the validated `*Auth` while issuing a new credential; `PasswordChanged` bulk-revokes the account's other sessions then rotates the acting one.
- **Rationale**: `Create` cannot adopt a client credential (fixation defense, FR-002) and its cookie replaces the client's previous one (US2.3); `Rotate` is what "preserves the logical session" for privilege changes (FR-009). Revoke-before-create keeps at most one valid credential at a time. Throttled idle writes keep SC-006.
- **Alternatives considered**: update every request (write amplification); idle fixed at creation (fails FR-008 sliding semantics); create-before-revoke (two valid credentials briefly); folding `Touch` into `Validate`'s store method (mixes read and write responsibilities, contrary to the user's split); requiring callers to pass `*Auth` into `Rotate` vs re-validating internally — passing the validated `*Auth` avoids a duplicate lookup and makes the trust source explicit.

## R8 — Events, fail-closed behavior, and housekeeping (FR-013, FR-019, FR-018)

- **Decision**: `EventSink.Record` receives `{At, Kind, AccountID, SessionID(digest), Outcome, Address, UserAgent}` for created/rotated/revoked/logged_out/expired; the default sink is structured `log/slog.Default()`; `WithEventSink` replaces it; sink errors are logged and never alter the auth outcome. `AccountRevoker.RevokeAccount` returns the revoked records so bulk revocation emits one event per session. Expiry detection denies and records `expired`; records are removed later by `Purge`. Validation denies on any store error or inconsistency. `Purge(ctx, purger, opts...)` runs on the caller's schedule.
- **Rationale**: auditable lifecycle records without secrets; authentication must not depend on audit availability. Fail-closed keeps "never silently succeed" true. Purge on caller schedule keeps storage bounded without a library-owned goroutine.
- **Alternatives considered**: revoking on expiry detection inside `Validate` (would make `Validate` depend on `Revoker`; the deadline check already denies, and `Purge` removes the record); mandatory sink with propagated errors (audit outage would take down auth); library janitor goroutine (YAGNI).

## R9 — Test strategy and seams (constitution IV, SC-001…SC-006)

- **Decision**: in-memory implementations of the seven role interfaces are written in `_test.go` (external `auth_test` package); tests use `net/http/httptest` over plain HTTP (transport is deployment-owned; assertions target the cookie `Secure` attribute, not request rejection), `WithClock`/short durations for deterministic timeouts, and shared-role values across two call sites to represent multi-instance/restart. Benchmarks/timing assertions cover SC-006.
- **Rationale**: honors "SQL is app domain" and "memory implementation in tests"; keeps security assertions black-box. Because capabilities are split, failing-double tests target exactly the operation that fails (e.g. a `Validator` that errors, a `Creator` that errors).
- **Alternatives considered**: shipping a memory store (rejected by user); a third-party SQLite driver in `go.mod` (violates stdlib-only).

## OWASP-derived control → requirement mapping (SC-002)

| Control | Where enforced | Requirement |
|---|---|---|
| High-entropy, unique credentials | `crypto/rand`, 128-bit minimum | FR-004 |
| One-way at-rest representation | SHA-256 digest only | FR-006 / SC-004 |
| Cookie hardening (`__Host-`, HttpOnly, Secure, SameSite) | cookie builder + `__Host-` validation | FR-005 |
| Session fixation defense | fresh credential; presented digest revoked on create | FR-002 / US2.2–2.3 |
| Idle + absolute timeouts | `Validate` + throttled `Touch` | FR-008 |
| Renewal/rotation on privilege change | `Rotate`/`PasswordChanged` | FR-009 / FR-011 |
| Logout and server-side revocation | `Logout`/`Revoke`/`RevokeAll` | FR-010 / FR-011 / FR-014 |
| CSRF synchronizer token | derived HMAC + `CheckCSRF` constant-time | FR-012 / US4 |
| Audit without secrets | `EventSink`, digest-only ids, redacting `Auth` | FR-013 |
| Bounded storage | `Purger` / `Purge` | FR-018 |
| Fail closed | deny on any store/validation failure | FR-019 |

Transport security (TLS) is deployment-owned (spec C3) and intentionally **not** a library control; the library neither inspects transport nor rejects plaintext requests. The `Secure` cookie attribute remains as cookie hardening (R6/D9/D13).

## Remaining open questions

None. Everything the spec leaves to the plan is decided above (D1–D18 in [plan.md](./plan.md)).