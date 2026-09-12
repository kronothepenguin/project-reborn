# Implementation Plan: 012 — HTTP Session-Based Authentication Library

**Branch**: `012-session-auth` | **Date**: 2026-09-11 | **Spec**: [/specs/012-session-auth/spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-session-auth/spec.md`. Planning directives from the user: **Go + standard library only**; CSRF via **synchronizer token**; **session layer only** (no credential verification — spec C1); **small functional API, no manager struct**; required dependencies are parameters, optional configuration are options; `Protect` is a closure returning reusable middleware; **persistence is many single-responsibility interfaces** (no fat store, no merged roles); SQL is app domain, memory lives in tests; purge is its own responsibility; **transport security (TLS) is deployment-owned** (spec C3) — no server-side transport check, `WithCookieSecure` only sets the cookie `Secure` attribute.

## Summary

Build `packages/auth` as a zero-dependency Go standard-library package that owns the server-side session lifecycle after the consuming application has verified credentials. The API is a small set of package-level functions — `Create`, `Validate`, `Protect`, `Rotate`, `Logout`, `PasswordChanged`, `Revoke`, `RevokeAll`, `List`, `Purge`, `CheckCSRF`, `NewContext`/`FromContext` — each taking the request/response (or `context.Context`), the required capability interfaces for exactly the operations it performs, and optional configuration. Persistence is split into seven single-method interfaces, one per responsibility: `Creator`, `Validator`, `Toucher`, `Revoker`, `AccountRevoker`, `Lister`, `Purger`. A concrete store (SQL) implements them all; tests implement them in memory. Routes, pages, credential verification, and storage drivers stay outside the library.

## Technical Context

**Language/Version**: Go 1.27 (`go.work`; `packages/auth/go.mod` already exists at `go 1.27.0`).

**Primary Dependencies**: Go standard library only — `crypto/rand`, `crypto/sha256`, `crypto/hmac`, `crypto/subtle`, `net/http`, `context`, `errors`, `time`, `log/slog`. Zero third-party imports.

**Storage**: Application-provided implementations of the persistence role interfaces. The library defines the contracts only; the in-memory fakes live in `_test.go`; SQL/persistence is app domain. A store snapshot contains only SHA-256 digests, never raw credentials.

**Testing**: `go vet ./...` + `go test ./...` in `packages/auth`; `net/http/httptest`, `t.Context()`, red-green per constitution IV.

**Target Platform**: Linux server; reusable library consumed by this project's HTTP apps.

**Project Type**: Library (single Go package).

**Performance Goals**: 95% of authenticated requests add < 10 ms (SC-006); O(1) lookup by credential digest; activity writes throttled by `WithTouchInterval` (default 1 minute).

**Constraints**: no third-party modules; transport security is deployment-owned and is never inspected by the library (spec C3); validation fails closed on store errors; raw credentials never persisted (only a one-way digest); audit records contain no secrets; at most one valid credential exists while rotating (revoke before create).

**Scale/Scope**: one package (~8 source files, ~7 test files); multiple app instances sharing one store; multiple concurrent sessions per account.

## Constitution Check

*GATE: passed before Phase 0 research; re-checked after Phase 1 design and after the 2026-09-11 C3 amendment (transport security deployment-owned; FR-003 removed).*

| Principle | Gate | Status |
|---|---|---|
| I. Defined Before Built (NON-NEGOTIABLE) | Every behavior traces to spec FR-001, FR-002, FR-004…FR-019 / US1–US5 / an edge case, or to a recorded decision D1–D18 below. Nothing invented. | PASS |
| II. No Silent Interpretation (NON-NEGOTIABLE) | Storage gap, CSRF shape, credential boundary, interface granularity, and the deployment-owned transport boundary (spec C3) were surfaced to the user and answered. Further interpretations (functional style, per-responsibility interfaces, Touch verb, derived CSRF, Session/Auth split, `AccountID`, granular options with mandatory rotation, `WithCookieSecure`) are recorded as decisions D1/D4/D6/D7/D13/D15/D16/D17. | PASS |
| III. Spec-Driven Development | Branch/spec/plan live under `specs/012-session-auth/`; `tasks.md` follows; requirements map to P1–P3 user stories. | PASS |
| IV. Test & Verification Discipline | Tests written first per user story and observed failing; gate is `go vet` + `go test ./...` in `packages/auth`; no tests orphaned. | PASS |
| V. KISS | One standard-library package; no manager struct, no framework, no generics, no background goroutines; every persistence interface has exactly one method. | PASS |
| VI. YAGNI | No SQL implementation, no janitor goroutine, no admin UI, no MFA/federation, no token scheme, no credential verifier. | PASS |
| VII. SOLID | Interface Segregation is structural: one single-method interface per responsibility; functions depend only on the capabilities they use (DIP); free functions have one responsibility each (SRP). | PASS |
| Additional Constraints | Auth is a package (no executable, no port); no JS; secrets never logged. | PASS |

**Complexity Tracking**: none — no constitution violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/012-session-auth/
├── plan.md              # this file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── library-api.md   # exported Go surface + semantics
│   └── store.md         # persistence role interfaces apps implement
├── checklists/
│   └── requirements.md  # already present
└── tasks.md             # created by /speckit.tasks (NOT here)
```

### Source Code (repository root)

```text
packages/auth/
├── go.mod               # module .../packages/auth — stdlib only
├── doc.go               # package documentation + usage example
├── auth.go              # errors, options (secure defaults), internal settings, ordering rules
├── session.go           # Session, Auth (redacting), credential + digest, timeouts, CSRF derivation
├── store.go             # Creator, Validator, Toucher, Revoker, AccountRevoker, Lister, Purger, ErrNotFound
├── cookie.go            # cookie set/clear, cookie hardening (no transport checks)
├── lifecycle.go         # Create, Validate, Rotate, Logout, PasswordChanged, Revoke, RevokeAll, List, Purge
├── middleware.go        # Protect, CheckCSRF, NewContext, FromContext
├── events.go            # Event, EventSink, default slog sink
└── *_test.go            # in-test memory role implementations + US1–US5 / SC tests
```

**Structure Decision**: the feature extends the existing empty shell `packages/auth` (already a workspace module). One package, files split by responsibility; no subpackages. The persistence roles and the public API are documented in `contracts/`; consumable code stays in the single package.

## Decisions (recorded — no silent interpretation)

- **D1 — Functional API, no manager struct** (user direction; KISS/SRP). Every operation is a package-level function: `Create`, `Validate`, `Protect`, `Rotate`, `Logout`, `PasswordChanged`, `Revoke`, `RevokeAll`, `List`, `Purge`, `CheckCSRF`, `NewContext`, `FromContext`. No exported type owns behavior; the two exported structs (`Session`, `Auth`) are plain data with a redacting `String`/`LogValue` only.
- **D2 — Required dependencies are parameters, optional configuration are options** (user direction): each function takes exactly the capability interfaces it needs; `opts ...Option` carries only optional settings and defaults always apply first, so no option is mandatory.
- **D3 — `Protect` is a closure with self-contained configuration** (user direction): `Protect(validator Validator, toucher Toucher, opts ...Option) func(http.Handler) http.Handler` resolves its settings once and returns reusable middleware; behavior: `Validate` → CSRF check on unsafe methods → put `*Auth` in the request context → `next`. Because its signature cannot return an error, invalid option values panic at construction time (`ErrConfig`-wrapped, documented as a programmer error); error-returning functions return `ErrConfig` instead.
- **D4 — Persistence is one interface per responsibility, every one single-method** (user direction; ISP):
  - `Creator` — `Create(ctx, *Session) error` (store a new session record).
  - `Validator` — `Validate(ctx, id) (*Session, error)` (fetch the session identified by a digest).
  - `Toucher` — `Touch(ctx, *Session) error` (record activity on an existing session).
  - `Revoker` — `Revoke(ctx, id) error` (revoke one session).
  - `AccountRevoker` — `RevokeAccount(ctx, accountID, except) ([]*Session, error)` (revoke every session of an account except one, reporting what was revoked).
  - `Lister` — `List(ctx, accountID) ([]*Session, error)` (enumerate an account's active sessions).
  - `Purger` — `Purge(ctx, now) (int, error)` (housekeeping: delete revoked/expired records).
  A concrete store commonly implements all seven; functions receive one argument per capability they use. No interface embeds another, and no interface mixes command, query, and housekeeping.
- **D5 — Store methods are domain operations, not generic Get/Set/Delete** (user direction): `Create` is insert-only and never upserts; `Validate` returns `ErrNotFound` for absent or revoked records; `Touch` writes activity only; `Revoke` is idempotent; `List` returns active records; `RevokeAccount` is one atomic bulk operation with one optional survivor. `id` is always the SHA-256 digest — no store ever receives the raw credential (FR-006).
- **D6 — `Touch` is its own responsibility**: the idle timeout must slide with activity (FR-008), and that write is neither validation nor revocation, so it is a separate interface used only by `Validate`/`Protect`.
- **D7 — CSRF = synchronizer token, derived, never stored and never in a cookie** (user choice; FR-012): `token = base64url(HMAC-SHA256(key = raw credential, message = "project-reborn/auth/csrf/v1"))`, exposed as `Auth.CSRF` and validated by `CheckCSRF`/`Protect` with `crypto/subtle.ConstantTimeCompare`. Accepted from `WithCSRFHeader` (default `X-CSRF-Token`) or `WithCSRFParam` (default `csrf_token`). It rotates with the credential and cannot be read cross-origin (no cookie, SOP).
- **D8 — Credentials**: `crypto/rand.Read` of `WithTokenBytes` bytes (default 32 = 256 bits, hard minimum 16 = 128 bits; FR-004, FR-016), encoded `base64.RawURLEncoding`; only `base64url(SHA-256(credential))` is persisted. `crypto/rand.Text()` was considered; a configurable byte length is required by FR-016.
- **D9 — Cookie hardening** (FR-005): default name `__Host-session`, `Path=/`, no `Domain`, `HttpOnly`, `Secure` (via `WithCookieSecure`, default true), `SameSite=Strict`; browser-session cookie by default, `Max-Age`/`Expires` = remember timeout only for "remember me". All attributes configurable; `__Host-` prefix validity (which requires `Secure`) is enforced before any cookie is written.
- **D10 — Timeouts** (FR-008): idle 30 min (slides on activity, writes throttled by `WithTouchInterval`, default 1 min), absolute 12 h, remember-me absolute 30 d. Absolute deadlines are computed once and never extended by activity, rotation, or another instance's clock; `Touch` only ever writes the idle deadline.
- **D11 — Replacement vs rotation**: `Create` reads any credential the client presents, revokes that digest (`Revoker`, idempotent), and creates a fresh session record (`Creator`); the new cookie replaces the old credential and the client-supplied value is never adopted (FR-002, US2.2–2.3). `Rotate` additionally preserves `AccountID`, `CreatedAt`, `AbsoluteExpiresAt`, and `Remember` from the validated `*Auth` before revoking and creating, so the logical session survives privilege changes (FR-009). `PasswordChanged` revokes all other sessions of the account through `AccountRevoker`, then rotates the acting session through `Revoker` + `Creator` (FR-011). Revoke-before-create guarantees at most one valid credential at any moment; a crash between the two fails closed.
- **D12 — Events** (FR-013): `Event{At, Kind, AccountID, SessionID(digest), Outcome, Address, UserAgent}`; kinds `created`, `rotated`, `revoked`, `logged_out`, `expired`; `EventSink.Record(ctx, Event) error`; default sink writes structured records through `log/slog.Default()`; `WithEventSink` replaces it. `RevokeAccount` returns the records it revoked so bulk revocation can emit one `revoked` event per session without a second query. Expiry detection denies and emits `expired`; the record is removed later by `Purger`. Sink failures are logged and never change the authentication outcome. No password, secret, or raw credential is ever placed in an event (SC-004).
- **D13 — Transport security is deployment-owned** (spec C3): the library never inspects transport and has no plaintext refusal, `ErrInsecure`, or `X-Forwarded-Proto` logic. The only transport-adjacent setting is the cookie `Secure` attribute, `WithCookieSecure` (default `true`): browser-side cookie hardening, not server-side enforcement. A `__Host-` cookie name still requires `Secure=true` (`ErrConfig` otherwise).
- **D14 — Fail closed** (FR-019): absent/malformed/multiple cookie, a cookie value longer than `maxCookieLength` (128 bytes), unknown/revoked/expired record, or any store error denies access with a generic response; authentication never silently succeeds and no partial session is stored when `Create` fails.
- **D15 — `Session` (persisted record, no secret) vs `Auth` (request view)**: `Auth` is a small struct with exported `Session Session` and `CSRF string`, plus an unexported credential used internally for rotation/CSRF; it implements redacting `String()`/`LogValue()` so `%v`/slog output cannot leak the credential. `Protect` stores `*Auth` in the context; `NewContext`/`FromContext` are the accessors.
- **D16 — `AccountID` is `int64`** (alias), matching the project's existing user identifiers; the library treats it as opaque.
- **D17 — Options are granular setters with secure defaults** (FR-016): `WithCookieName`, `WithCookiePath`, `WithCookieDomain`, `WithSameSite`, `WithCookieSecure`, `WithIdleTimeout`, `WithAbsoluteTimeout`, `WithRememberTimeout`, `WithTouchInterval`, `WithTokenBytes`, `WithCSRFHeader`, `WithCSRFParam`, `WithClock` (test seam), `WithEventSink`, `WithUnauthorizedHandler`, `WithForbiddenHandler`. Any function may receive any option; unrecognized options are simply unused by that function, and defaults always apply first. Rotation itself (on create and privilege change) is mandatory and always on — making fixation defense optional would contradict FR-002.
- **D18 — Error taxonomy**: exported sentinels `ErrNoSession`, `ErrExpired`, `ErrRevoked`, `ErrCSRF`, `ErrConfig`; exported `ErrNotFound` for stores to return from `Validate`; all wrapped with `%w` and matchable with `errors.Is`.

## Parameter order (documented convention)

- `context.Context` first when the function is not request-bound.
- `http.ResponseWriter` then `*http.Request` first on request-bound functions.
- Subject values next (`accountID`, `sessionID`, `*Auth`).
- Required capability interfaces after the subject, in invocation order (e.g. revoke before create).
- `opts ...Option` always last.
- Interface methods: `ctx` first, then the identifying value (`id`, `accountID`, `*Session`), then data.

## Public API outline (full signatures in `contracts/library-api.md`)

```go
type Creator interface       { Create(ctx context.Context, session *Session) error }
type Validator interface     { Validate(ctx context.Context, id string) (*Session, error) }
type Toucher interface       { Touch(ctx context.Context, session *Session) error }
type Revoker interface       { Revoke(ctx context.Context, id string) error }
type AccountRevoker interface{ RevokeAccount(ctx context.Context, accountID AccountID, except string) ([]*Session, error) }
type Lister interface        { List(ctx context.Context, accountID AccountID) ([]*Session, error) }
type Purger interface        { Purge(ctx context.Context, now time.Time) (int, error) }

// request flow — r carries the context
func Create(w http.ResponseWriter, r *http.Request, accountID AccountID, revoker Revoker, creator Creator, opts ...Option) (*Auth, error)
func Validate(r *http.Request, validator Validator, toucher Toucher, opts ...Option) (*Auth, error)
func Protect(validator Validator, toucher Toucher, opts ...Option) func(http.Handler) http.Handler
func Rotate(w http.ResponseWriter, r *http.Request, a *Auth, revoker Revoker, creator Creator, opts ...Option) (*Auth, error)
func Logout(w http.ResponseWriter, r *http.Request, revoker Revoker, opts ...Option) error
func PasswordChanged(w http.ResponseWriter, r *http.Request, a *Auth, accountRevoker AccountRevoker, revoker Revoker, creator Creator, opts ...Option) (*Auth, error)

// administration / housekeeping — no request, explicit context
func Revoke(ctx context.Context, sessionID string, revoker Revoker, opts ...Option) error
func RevokeAll(ctx context.Context, accountID AccountID, accountRevoker AccountRevoker, opts ...Option) error
func List(ctx context.Context, accountID AccountID, lister Lister, opts ...Option) ([]*Session, error)
func Purge(ctx context.Context, purger Purger, opts ...Option) (int, error)

// CSRF + context
func CheckCSRF(r *http.Request, a *Auth, opts ...Option) error
func NewContext(ctx context.Context, a *Auth) context.Context
func FromContext(ctx context.Context) (*Auth, bool)
```

## Phases

- **Phase 0 — Research** (this command): resolve unknowns; `research.md` records each decision with rationale and alternatives. No `NEEDS CLARIFICATION` remains.
- **Phase 1 — Design** (this command): `data-model.md`, `contracts/library-api.md`, `contracts/store.md`, `quickstart.md`.
- **Phase 2 — Options, primitives, persistence roles (tests first)**: errors and all `Option` setters with secure defaults (`auth.go`), credential + digest + CSRF derivation + `Session`/`Auth` (`session.go`), the seven role interfaces (`store.go`), in-test memory role implementations; foundational tests for options, primitives, and events (FR-004/FR-006/FR-013/FR-016) are written first and observed failing; US2 story assertions stay in Phase 4.
- **Phase 3 — Request lifecycle**: cookies + cookie hardening (`cookie.go`), `Create`/`Validate`/`Rotate`/`Logout`/`PasswordChanged`/`Revoke`/`RevokeAll`/`List`/`Purge` (`lifecycle.go`), `Protect`/`CheckCSRF`/context (`middleware.go`); cover US1, US4 and edge cases with `httptest`.
- **Phase 4 — Audit**: event sink (`events.go`), lifecycle events including bulk revocation and expiry; cover US3 and US5/FR-018.
- **Phase 5 — Docs + gate**: package doc/example, quickstart alignment; `go vet ./...` + `go test ./...`.

## Verification & Gates

- Per-affected-module gate (constitution IV): `cd packages/auth && go vet ./... && go test ./...` — must stay green after every phase.
- SC-001: quickstart wires a login/protected/logout test app by calling functions, with no security-sensitive app code.
- SC-002/SC-003: security tests assert entropy, digest-only storage, cookie attributes (`__Host-`, `HttpOnly`, `Secure`, `SameSite`), fixation/replay rejection, rotation, timeouts, CSRF accept/reject, fail-closed.
- SC-004: the in-test store is inspected to prove no raw credential is present.
- SC-005: two independent call sites share one store (multi-instance) and fresh state over the same store recognizes live sessions (restart); `Purge` removes only expired/revoked.
- SC-006: a timing test over the in-memory store with N ≥ 10,000 samples asserts the 95th percentile of added validation latency is < 10 ms (p95, not the mean).

## Out of Scope

- SQL/driver code, schema migrations, and any persistence implementation (app domain, per user).
- Credential verification, hashing, passwords, throttling (spec C1/FR-001).
- CMS route/page wiring and login UI.
- Background janitor goroutine, admin UI, rate limiting, MFA, federation.
- JS/Astro changes.