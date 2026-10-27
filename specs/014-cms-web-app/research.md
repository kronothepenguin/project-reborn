# Research: CMS Web Application

**Feature**: `014-cms-web-app` | **Date**: 2026-09-16

Decisions resolved with the user for the index slice, written so later slices
can extend them without reworking the foundation.

## R1 — Package layout: Go backend, Astro shells

**Decision**: `packages/cms` owns the implementation (HTTP handlers, session
helpers, Astro pages, embedded `dist/`); `apps/cms` owns the process (embed or
proxy, listen address, serve).

**Rationale**: The workspace rule: packages export the implementation, apps
are thin runners.

**Alternatives considered**: serving from the app directly — duplicates the
package's HTTP surface outside its module.

## R2 — Handlers consume generated store operations directly

**Decision**: `GET /{$}` and `POST /{$}` call the `*store.Store` methods
directly; no service struct, no adapter, no consumer-defined interface.

**Rationale**: One code path from request to SQL, with the store as the single
data-access API.

**Alternatives considered**: a domain service package — an extra layer between
handler and store for the same calls.

## R3 — Process store accessor `store.Must()`

**Decision**: The deployment store comes from `store.Must()`, delivered by the
`013-store-library` addendum: it reads `config.Must().Database.Path`, opens
once per process with `store.Open`, caches the instance, and panics on failure.
`CMS.Mount` obtains it and passes it to `router.New`; the app runners never
touch the store, and tests open isolated stores with `store.Open` directly.

**Rationale**: The store is required by every deployment and must not be
optional wiring; one accessor mirrors `config.Must` and keeps constructors
free of paths.

**Alternatives considered**: an optional `WithStore` option (optional wiring
for a required dependency); app-side `store.Open` (the path is deployment
configuration, not app code).

## R4 — Session mechanics as plain functions

**Decision**: `internal/router/session.go` holds unexported functions: cookie
build/clear, session create (token → SHA-256 digest row), `Guard`, and the
lazy purge. `router.go` keeps only the `Router` struct and `New`.

**Rationale**: Session handling is one file with no interfaces, easy to read
and to replace when a later slice adopts a shared session helper.

## R5 — Session values and cookies

**Decision**: Token 32 random bytes, stored as a SHA-256 hex digest in
`sessions.id`; cookie `__Host-session`, `Path=/`, `HttpOnly`, `Secure`,
`SameSite=Strict`, no `Domain`; idle 30 min, absolute 12 h, remember 30 d;
`Max-Age` only when "remember me" was chosen. These match the fixed decisions
of `012-session-auth` so behavior stays consistent.

**Rationale**: Hardened by default with no environment-dependent downgrade;
browsers accept `Secure` cookies on `http://localhost` because it is a
trustworthy origin, so development and production use the same attributes.

## R6 — Cross-site protection: nonce plus `SameSite`

**Decision**: The sign-in form carries a hidden `csrf_token` input checked
against the `__Host-csrf` cookie (double submit, constant-time compare) before
any credential or throttle work; sessioned routes rely on `SameSite=Strict`.

**Rationale**: A cross-site POST cannot know the nonce and fails before
verification, satisfying the spec's cross-site edge case without a middleware
layer or an origin allowlist.

## R7 — Lazy session purge

**Decision**: `POST /{$}` (and `Guard` when mounted) deletes revoked or
past-deadline rows through `PurgeSessions`, which becomes parameterless: the
statement compares against the database clock.

**Rationale**: Sessions are cleaned exactly when the application is already
doing session work; no ticker, no background goroutine, no cutoff arguments
the caller would always set to `now`.

## R8 — Throttle over `login_attempts`

**Decision**: The attempt key is the canonical username; a lock blocks before
verification; failures increment window-aware and lock at 5 within 15 minutes
for 15 minutes; success clears the key. Window, limit, and lock are named
constants matching the spec's default policy.

**Rationale**: The store's `login-attempts` operations already implement the
window semantics; one lookup key keeps the flow readable.

## R9 — Account-enumeration resistance

**Decision**: Unknown username and wrong password render the same message; an
unknown username still runs a bcrypt comparison against a fixed dummy hash.
The submitted username is echoed; the password is never retained.

**Rationale**: Spec edge case: neither the page nor its timing reveals
account existence (FR-010).

## R10 — The homepage always shows the hotel offline

**Decision**: `signed-out.astro` renders "0 users online now" and the red
"Hotel offline" state unconditionally; `index.astro` and the layout bind no
status data. Footer targets are the fixed routes `/`, `/disclaimer`,
`/privacy`.

**Rationale**: Spec clarification 2026-09-16 ("just show offline always") and
FR-005/FR-013 fix the routes; values that never vary are markup, not template
data.

## R11 — `Guard` and protected pages

**Decision**: `Guard` validates the session cookie against `sessions`, clears
it and redirects to `/` when absent, revoked, or past the absolute deadline,
refreshes the idle deadline when only idle-expired, then calls the next
handler. Slice 2 mounts it on `/me` and the client page.

**Rationale**: One place implements "is this visitor signed in?", so every
future member page shares it; the index slice ships and tests it.

## R12 — Configuration: `cms` section now, `database` with the store

**Decision**: `packages/config/cms` declares `Host` and `Port` (defaults
`localhost` and `17387`, the port `tools/create` assigns to an app named
`cms`). Production runners read `config.Must().CMS.Host`/`.CMS.Port`;
development hardcodes them. The `database` section (`Path`, default
`habbo.db`) ships with `store.Must()` in the `013-store-library` addendum.

**Rationale**: Only deployment-varying settings are declared; each section
lives with its consumer, and no environment variables are read anywhere.

## R13 — UI edits for the index slice

**Decision**: Three small edits to existing files: the hidden `csrf_token`
input in `index.astro`; the unconditional offline header in
`signed-out.astro`; the fixed footer `href`s in `signed-out.astro`. Everything
else renders as it does today. The `me` page and layout arrive with Slice 2.

**Rationale**: The layout looks the way the user wants; only the parts that no
longer vary (status, link targets) and the new nonce change.

## R14 — Tests with the slice

**Decision**: `internal/router` tests cover: offline render; nonce accept and
reject; empty-field errors; lock; invalid credential with no session;
successful sign-in with cookie attributes, session row, and cleared counters;
`Guard` invalid/idle/absolute paths; lazy purge. `packages/config` follows the
section test workflow; `packages/store` keeps `make test`, `make check-docs`,
and a clean regeneration diff after the `PurgeSessions` change.

**Rationale**: Constitution IV; the tests exercise the exact contracts in
`contracts/http.md` and `contracts/persistence.md`.

## R15 — Delivery slices and growing artifacts

**Decision**: Slice 1 (this branch) is the index view and sign-in backend.
Slice 2 adds registration, the signed-in layout, the personal page, sign-out,
and the client entry. Slice 3 adds recovery. Each slice starts by updating
`spec.md` and the contracts, then implements; existing files gain routes,
pages, and helpers without rework.

**Rationale**: The spec covers the CMS as a whole while each delivery is a
reviewable MVP increment, so the artifacts stay accurate at every step.