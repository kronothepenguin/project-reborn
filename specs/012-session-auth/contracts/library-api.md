# Contract: `packages/auth` Public Go API — 012

Import path: `github.com/kronothepenguin/project-reborn/packages/auth` (workspace module). Standard library only. The API is package-level functions: required dependencies are parameters, optional configuration are options, and `Protect` is a closure. Persistence is seven single-method interfaces, one per responsibility.

This contract is the complete exported surface. Signatures are fixed; behavior bullets are normative. Implementation bodies live in `packages/auth`.

## Data types (no behavior beyond redaction)

```go
type AccountID = int64 // opaque to the library; matches the project's account ids

type Session struct {
    ID                string    // base64url(sha256(credential)) — never the credential
    AccountID         AccountID
    CreatedAt         time.Time
    LastSeenAt        time.Time
    IdleExpiresAt     time.Time
    AbsoluteExpiresAt time.Time
    Remember          bool
    RevokedAt         time.Time // zero = active
    UserAgent         string
    Address           string
}

type Auth struct {
    Session Session // validated record
    CSRF    string  // synchronizer anti-forgery value for this session
    // credential is unexported; never persisted and never returned
}

func (a *Auth) String() string        // redacts the credential
func (a *Auth) LogValue() slog.Value  // redacts the credential
```

## Events (audit records — digest only, never credentials)

```go
type EventKind string

const (
    EventCreated   EventKind = "created"
    EventRotated   EventKind = "rotated"
    EventRevoked   EventKind = "revoked"
    EventLoggedOut EventKind = "logged_out"
    EventExpired   EventKind = "expired"
)

type Outcome string

const (
    OutcomeOK     Outcome = "ok"
    OutcomeDenied Outcome = "denied"
)

type Event struct {
    At        time.Time
    Kind      EventKind
    AccountID AccountID
    SessionID string // digest, never the credential
    Outcome   Outcome
    Address   string
    UserAgent string
}

type EventSink interface {
    Record(ctx context.Context, event Event) error
}
```

## Persistence roles (each interface has exactly one method)

```go
type Creator interface {
    Create(ctx context.Context, session *Session) error
}

type Validator interface {
    Validate(ctx context.Context, id string) (*Session, error)
}

type Toucher interface {
    Touch(ctx context.Context, session *Session) error
}

type Revoker interface {
    Revoke(ctx context.Context, id string) error
}

type AccountRevoker interface {
    RevokeAccount(ctx context.Context, accountID AccountID, except string) ([]*Session, error)
}

type Lister interface {
    List(ctx context.Context, accountID AccountID) ([]*Session, error)
}

type Purger interface {
    Purge(ctx context.Context, now time.Time) (int, error)
}
```

A concrete store commonly implements all seven; each function receives one argument per capability it uses. Full semantics (including `ErrNotFound`, idempotency, atomicity, and reporting of revoked records): [store.md](./store.md).

## Options (all optional; secure defaults always apply first)

```go
type Option func(*settings) // settings is unexported

func WithCookieName(name string) Option
func WithCookiePath(path string) Option
func WithCookieDomain(domain string) Option
func WithSameSite(mode http.SameSite) Option
func WithCookieSecure(secure bool) Option
func WithIdleTimeout(d time.Duration) Option
func WithAbsoluteTimeout(d time.Duration) Option
func WithRememberTimeout(d time.Duration) Option
func WithTouchInterval(d time.Duration) Option
func WithTokenBytes(n int) Option
func WithCSRFHeader(name string) Option
func WithCSRFParam(name string) Option
func WithClock(now func() time.Time) Option
func WithEventSink(sink EventSink) Option
func WithUnauthorizedHandler(h http.Handler) Option
func WithForbiddenHandler(h http.Handler) Option
```

- Defaults: `__Host-session`, path `/`, host-only, `Secure=true` (`WithCookieSecure`), `SameSite=Strict`, idle `30m`, absolute `12h`, remember `30d`, touch `1m`, 32 token bytes, `X-CSRF-Token`/`csrf_token`, real clock, `slog.Default()` sink, generic 401/403 handlers.
- Transport security (TLS) is deployment-owned (spec C3): the library never requires, inspects, or rejects based on transport. `WithCookieSecure` controls only the cookie `Secure` attribute (browser-side cookie hardening).
- Invalid values yield `ErrConfig` (returned by error-returning functions; `Protect` panics at construction time, since it cannot return an error — see below).

## Parameter order convention

- `context.Context` first on non-request functions.
- `http.ResponseWriter` then `*http.Request` first on request functions.
- Subject values next (`accountID`, `sessionID`, `a *Auth`).
- Required capability interfaces after the subject, in invocation order.
- `opts ...Option` always last.

## Request-flow functions (the request carries the context)

```go
func Create(w http.ResponseWriter, r *http.Request, accountID AccountID, revoker Revoker, creator Creator, opts ...Option) (*Auth, error)
func Validate(r *http.Request, validator Validator, toucher Toucher, opts ...Option) (*Auth, error)
func Protect(validator Validator, toucher Toucher, opts ...Option) func(http.Handler) http.Handler
func Rotate(w http.ResponseWriter, r *http.Request, a *Auth, revoker Revoker, creator Creator, opts ...Option) (*Auth, error)
func Logout(w http.ResponseWriter, r *http.Request, revoker Revoker, opts ...Option) error
func PasswordChanged(w http.ResponseWriter, r *http.Request, a *Auth, accountRevoker AccountRevoker, revoker Revoker, creator Creator, opts ...Option) (*Auth, error)
```

### `Create` — establish a session after the app verified credentials

- Requires explicit application call after credential verification (spec C1/FR-001); passwords never reach the library.
- Reads any credential the client presents, derives its digest, and revokes it through `revoker` (idempotent) **before** creating the new record; the client-supplied value is never adopted (FR-002, US2.2–2.3).
- Unconditionally generates a fresh credential (configurable entropy, ≥128 bits), computes `CreatedAt`/`LastSeenAt`/`IdleExpiresAt`/`AbsoluteExpiresAt`, persists via `creator`, sets the hardened cookie, records `created`.
- On any failure no record is stored and no cookie is set; if `revoker` fails the call aborts (fail closed).
- Errors: `ErrConfig`, wrapped store errors.

### `Validate` — resolve and validate the request's session

- Reads the configured cookie; rejects absent, malformed, values longer than 128 bytes, or unknown values with `ErrNoSession` (FR-007).
- `validator.Validate` gets the digest; `ErrNotFound` maps to `ErrNoSession`. A store that returns a record with a non-zero `RevokedAt` (contract violation) is denied with `ErrRevoked` — defense in depth.
- Absolute expiry (`now >= AbsoluteExpiresAt`) and idle expiry (`now >= IdleExpiresAt`) deny with `ErrExpired` and record `expired`; the record is removed later by `Purge` (FR-018).
- Slides the idle deadline through `toucher.Touch` at most once per `WithTouchInterval`; never touches `AbsoluteExpiresAt` (FR-008). A touch error denies (fail closed).
- Returns an `*Auth` whose `Session` is the record and whose `CSRF` is the derived token.
- Errors: `ErrConfig`, `ErrNoSession`, `ErrExpired`, wrapped store errors.

### `Protect` — reusable middleware

- Resolves options once; returns `func(http.Handler) http.Handler`; panics with an `ErrConfig`-wrapped message when options are invalid (construction-time programmer error, documented).
- Per request: `Validate` → on unsafe methods (`POST`/`PUT`/`PATCH`/`DELETE`) `CheckCSRF` → `NewContext` → `next`.
- Authentication failure invokes `WithUnauthorizedHandler` (default generic `401`); CSRF failure invokes `WithForbiddenHandler` (default generic `403`). `next` is not called on denial (FR-012, FR-019).

### `Rotate` — credential rotation for privilege changes (FR-009)

- Takes the validated acting `*Auth`; builds the replacement record preserving `AccountID`, `CreatedAt`, `AbsoluteExpiresAt`, and `Remember`, with a fresh credential and refreshed `LastSeenAt`/`IdleExpiresAt`.
- Revokes the old digest through `revoker`, then creates the new record through `creator`; sets the new cookie and records `rotated`.
- Revoke-before-create keeps at most one valid credential at any moment; if creation fails after revocation the session is lost and the call errors (fail closed).
- Errors: wrapped store errors.

### `Logout` — revoke and clear (FR-010)

- Revokes the presented credential through `revoker` and always clears the cookie; idempotent (no cookie → still clears, no error) and records `logged_out` when a cookie was presented.
- Returns a wrapped store error if revocation failed (the cookie is still cleared).

### `PasswordChanged` — invalidate other sessions and rotate the acting one (FR-011)

- Revokes all other sessions of the account through `accountRevoker.RevokeAccount(ctx, accountID, a.Session.ID)` and records one `revoked` event per returned record.
- Then rotates the acting session through `revoker` + `creator` (as `Rotate`).
- The acting session remains valid with a fresh credential; every other credential stops working immediately.
- Errors: wrapped store errors.

## Administration / housekeeping (no request; explicit context)

```go
func Revoke(ctx context.Context, sessionID string, revoker Revoker, opts ...Option) error
func RevokeAll(ctx context.Context, accountID AccountID, accountRevoker AccountRevoker, opts ...Option) error
func List(ctx context.Context, accountID AccountID, lister Lister, opts ...Option) ([]*Session, error)
func Purge(ctx context.Context, purger Purger, opts ...Option) (int, error)
```

- `Revoke` revokes one session by digest and records `revoked`; idempotent (FR-014).
- `RevokeAll` bulk-revokes every session of an account, records `revoked` for each returned record, and immediately invalidates the credentials (FR-014).
- `List` returns the account's active sessions with identifying metadata, filtering out records whose idle or absolute deadline has passed according to the configured clock; ordering is not significant (FR-014).
- `Purge` deletes revoked and past-deadline records using the configured clock and returns the removed count; active sessions are never removed (FR-018).

## CSRF and request context

```go
func CheckCSRF(r *http.Request, a *Auth, opts ...Option) error
func NewContext(ctx context.Context, a *Auth) context.Context
func FromContext(ctx context.Context) (*Auth, bool)
```

- `CheckCSRF` is a no-op (`nil`) for safe methods (`GET`/`HEAD`/`OPTIONS`/`TRACE`) and validates the synchronizer token on unsafe methods; the token is read from `WithCSRFHeader` first, then `WithCSRFParam` (parsing the form), and compared constant-time with `a.CSRF`; mismatch/missing → `ErrCSRF` (FR-012).
- `NewContext`/`FromContext` are the context seam for custom middleware; `Protect` uses them internally.

## Errors

```go
var (
    ErrNoSession = errors.New("auth: no session")
    ErrExpired   = errors.New("auth: session expired")
    ErrRevoked   = errors.New("auth: session revoked")
    ErrCSRF      = errors.New("auth: invalid CSRF token")
    ErrConfig    = errors.New("auth: invalid configuration")
    ErrNotFound  = errors.New("auth: session not found") // stores return this from Validate
)
```

All errors are matchable with `errors.Is`; store errors are wrapped with `%w` and deny access.

## Minimal app wiring (shape, not implementation)

```go
// one concrete store implements all seven role interfaces
var store = newSQLStore(db)

// login, after the app verified the credentials:
a, err := auth.Create(w, r, user.ID, store, store)

// protected routes — the middleware is configured once and reused:
protect := auth.Protect(store, store, auth.WithIdleTimeout(20*time.Minute))
mux.Handle("POST /admin", protect(adminHandler))

// inside a handler or template:
a, _ := auth.FromContext(r.Context())
token := a.CSRF                   // hidden input value
role := lookup(a.Session.AccountID)

// logout:
_ = auth.Logout(w, r, store)

// privilege change (acting session keeps its logical identity, others die):
a2, _ := auth.PasswordChanged(w, r, a, store, store, store)

// admin page:
sessions, _ := auth.List(r.Context(), user.ID, store)

// scheduled housekeeping, app-owned goroutine:
n, _ := auth.Purge(ctx, store)
```

## Non-goals enforced by this contract

- No password collection, hashing, or verification (spec C1/FR-001).
- No route/page ownership; `Protect` wraps handlers the app provides.
- No persistence implementation or driver dependency.
- No session cookie access from scripts; the CSRF value is never a cookie.
- No transport enforcement; TLS is owned by the deployment (spec C3).