# Quickstart — 012 HTTP Session-Based Authentication Library

**Prerequisites**: Go 1.27 (workspace root `go.work` includes `packages/auth`). No third-party modules, no database, no running app required.

**Gate**:

```sh
cd packages/auth
go vet ./...
go test ./...
```

Every scenario below is an automated test in `packages/auth` (`*_test.go`), using `net/http/httptest` and in-test in-memory implementations of the seven persistence roles (`Creator`, `Validator`, `Toucher`, `Revoker`, `AccountRevoker`, `Lister`, `Purger`; contracts in [contracts/store.md](./contracts/store.md)). No SQL/driver is needed; persistence is app domain.

## Prerequisites for app integration

1. The app verifies credentials itself (spec C1) and then calls `auth.Create` with the verified account id and the store roles it implements.
2. The app supplies the role interfaces (one concrete store usually implements all seven) and a `Purger` if it wants scheduled cleanup.
3. The app wraps protected handlers with `auth.Protect(validator, toucher, opts...)` and renders `a.CSRF` into state-changing forms; the full surface is in [contracts/library-api.md](./contracts/library-api.md).

## Scenario 1 — Login, stay recognized, logout (US1, SC-001)

- POST "credentials" to a test login handler that calls `auth.Create(w, r, accountID, revoker, creator)` (as if verification succeeded) and returns the cookie.
- Assert: a later request through `auth.Protect(validator, toucher)` resolves the account; `auth.FromContext` returns it.
- Assert: no session is issued when the app does not call `Create` (failed verification).
- Call `auth.Logout(w, r, revoker)`; assert the response clears the cookie and replaying the old cookie is denied by `auth.Validate(r, validator, toucher)`.

## Scenario 2 — Forgery, fixation, hijack resistance (US2, SC-002, SC-003, SC-004)

- **Entropy/uniqueness**: sample many credentials; assert decoded length ≥ 128 bits and uniqueness.
- **At rest**: inspect every record held by the test store; assert no stored value matches any issued credential (`Session.ID` is a digest only).
- **Fixation**: present a valid session credential to `Create`; assert that digest is revoked and the response carries a different credential that is not the presented one.
- **Cookie hardening**: inspect `Set-Cookie`; assert `HttpOnly`, `Secure` (default; `WithCookieSecure(true)`), `SameSite=Strict`, `Path=/`, `__Host-` prefix, and no `Domain`.
- **Timeouts**: with `WithClock` and short `WithIdleTimeout`/`WithAbsoluteTimeout`, assert idle expiry rejects after inactivity, continuous activity keeps a session alive, and activity never extends the absolute deadline.
- **Rotation/logout/revocation replay**: after each, assert the retired credential is rejected.

## Scenario 3 — Containment and audit (US3, FR-011, FR-013, FR-014)

- Create several sessions for one account; `auth.List(ctx, accountID, lister)` returns them with creation/last-activity/origin metadata.
- `auth.Revoke(ctx, sessionID, revoker)` one and `auth.RevokeAll(ctx, accountID, accountRevoker)`; assert immediate rejection on the next `Validate`.
- Call `auth.PasswordChanged(w, r, a, accountRevoker, revoker, creator)` while acting as one session; assert every other session is rejected, the acting session remains valid with a rotated credential, and the new credential works.
- Capture events from a test `EventSink` (`WithEventSink`); assert one record per lifecycle action with timestamp, account, digest, outcome, and origin, and assert no raw credential/password text appears in any event.

## Scenario 4 — CSRF proof (US4, FR-012)

- With an authenticated session, send an unsafe method with the correct `X-CSRF-Token` (and, separately, the correct form field); assert the handler runs.
- Send the same request missing/forged/wrong-session tokens; assert `403` and that the handler did not run.
- Assert the token is not present in any `Set-Cookie` and differs after rotation.

## Scenario 5 — Restarts, multiple instances, cleanup (US5, SC-005, FR-017, FR-018)

- Reuse one store value across two independent `Protect` closures (two "app instances"): a session created by one is accepted by the other, and revocation through one is honored by the other.
- Recreate the middleware/option set from scratch over the same store ("restart"); assert live sessions remain valid.
- `auth.Purge(ctx, purger, WithClock(...))`; assert expired/revoked records are removed, active records remain, and the returned count matches.

## Cross-cutting checks

- **Fail closed**: failing role doubles (e.g. a `Validator` or `Toucher` that errors) make `Validate`/`Protect` deny; authentication never succeeds. A failing `Creator` leaves no record and no cookie.
- **Transport ownership (C3)**: a plain HTTP request is authenticated normally — the library performs no transport check; with a non-`__Host-` cookie name, `WithCookieSecure(false)` removes only the cookie `Secure` attribute (`__Host-` names require `Secure=true`).
- **Edge cases**: multiple cookies, malformed values, and values longer than 128 bytes are denied without internal detail; no address/user-agent binding locks out a changed client; concurrent `Protect` calls during a rotation observe at most one valid credential.
- **Performance (SC-006)**: a benchmark over the in-memory store asserts validation stays well below the 10 ms budget.

## Out of scope for this quickstart

SQL/schema/driver code, CMS pages and routes, login UI, password hashing/verification, throttling (spec C1), and transport security/TLS termination (spec C3) — all application or deployment domain. The reference SQLite column mapping is guidance only in [contracts/store.md](./contracts/store.md).