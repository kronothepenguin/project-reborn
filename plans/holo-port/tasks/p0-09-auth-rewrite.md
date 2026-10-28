---
type: Task
title: Rewrite packages/auth
description: Replace the session-only library with argon2id passwords, habbo-name login with throttling and bans, sessions, middleware, attributes and password reset.
status: done
phase: p0
depends_on: [p0-06, p0-13]
packages: [packages/auth]
holo: [source/holo/includes/inc.crypt.php, source/holo/index.php, source/holo/logout.php, source/holo/security_check.php, source/holo/forgot.php, source/holo/core.php]
timestamp: 2026-10-27T23:25:58+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-27T23:25:58+00:00"}
---

# Goal

A shared auth package for cms, housekeeping and the installer, as described in
[0005](/decisions/0005-argon2id-passwords.md), [0014](/decisions/0014-attribute-based-access.md),
[0015](/decisions/0015-attribute-names-and-fuses.md) and [0018](/decisions/0018-password-reset-by-email.md).

# Steps

- [x] Delete every file of the current `packages/auth`. The new `go.mod` requires `packages/virtual`,
      `packages/store` and `golang.org/x/crypto`.
- [x] `New(db *sql.DB, s *virtual.Settings) *Auth`.
- [x] Passwords: argon2id PHC hash, verify, needs-rehash (m=19456 KiB, t=2, p=1).
- [x] `Login(w, r, habboName, password, remember)`:
  - throttling per IP and per user from `login_attempts`;
  - `ErrBanned` with reason and expiry;
  - rehash when needed;
  - the session cookie.
- [x] Sessions:
  - 32 random bytes in the cookie, SHA-256 digest in the database;
  - HttpOnly, SameSite=Lax, Secure from `auth.secureCookies`;
  - Max-Age only for remember-me;
  - sliding expiry written at most once a minute.
- [x] `Logout`, `LogoutEverywhere(userID)`, `SwitchHabbo(w, r, avatarID)`.
- [x] Middleware `Sessions`, `RequireSession` (redirect for pages, 401 for JSON), `RequireAttribute`; `FromContext`.
- [x] The `Attribute` type, the catalogue with descriptions, and `Attributes(ctx, userID)`.
- [x] `CreateReset(ctx, email)` and `ResetPassword(ctx, token, password)`.
- [x] Table tests on a temporary database: hash round trip, wrong password, throttle, ban, session and remember
      cookies, sliding expiry, habbo-switch ownership, reset single use and expiry, attribute union.

# Verification

```sh
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
```

Results (2026-10-27T23:25:58+00:00):

- `gofmt -l .` and `go vet ./...`: no output.
- `go test ./... -race`: ok in about 14 s; 38 test results (32 tests and 6 ban subtests), 0 failures.
- Mutation checks: each of eleven rules was broken on purpose and each time a test failed:
  - IP throttle, user throttle;
  - the ban check, and hiding a ban behind the password;
  - the token digest;
  - ending sessions and other resets after a reset;
  - sliding at most once a minute, sliding at all;
  - habbo ownership on switch;
  - the attribute check.
- `go build ./...` and `go vet ./...` pass in every workspace module: `packages/auth`, `packages/virtual`,
  `packages/config`, `packages/store`, `packages/cms`, `apps/cms`, `packages/astro`, `tools/create`.
- The attributes in `packages/store/knowledge/entities/access-group.md` match the catalogue (18 each).

# Notes

API as built:

- `New(db, settings)`; `Login(w, r, habboName, password, remember) (Session, error)`; `Logout(w, r)`;
  `LogoutEverywhere(ctx, userID)`; `SwitchHabbo(ctx, avatarID)`.
- `Sessions(next)`, `RequireSession(next)`, `RequireAttribute(attr)`, `FromContext(ctx) (Session, bool)`.
- `HashPassword`, `VerifyPassword`, `NeedsRehash`, `ValidatePassword`.
- `Attribute` constants, `Catalogue()`, `Attributes(ctx, userID)`.
- `CreateReset(ctx, email) (string, error)`, `ResetPassword(ctx, token, password)`.
- Errors: `ErrInvalidCredentials`, `ErrThrottled`, `ErrBanned` (`*BanError` carries the reason and expiry),
  `ErrNoSession`, `ErrNotOwner`, `ErrPasswordLength`, `ErrInvalidReset`.

Signature changes from the plan:

- `SwitchHabbo(ctx, avatarID)` instead of `(w, r, avatarID)`: it writes no cookie and reads the session from the
  context.
- `LogoutEverywhere` takes a context.
- `RequireSession` is a package function because it needs no state.
- `HashPassword` returns no error, since `crypto/rand.Read` cannot fail as of Go 1.24.

Choices:

- Cookie `reborn_session` without the `__Host-` prefix: that prefix requires `Secure`, and `auth.secureCookies` can be
  false for local HTTP.
- Login order:
  - IP throttle, habbo lookup, user throttle, password, then ban;
  - a ban is shown only to someone who knows the password;
  - an unknown habbo still runs argon2 on a fixed hash;
  - throttled attempts are not recorded, banned ones are recorded as failures.
- Expired sessions are purged at each login and expired resets at each `CreateReset`; there is no background job.
- The expiry slides only when the last write is a minute old. A remembered session also gets its cookie renewed;
  other cookies end with the browser.
- `RequireSession` recognizes JSON by the `Accept` header. The 401, 403 and 500 answers are plain text.
- `ValidatePassword` counts characters, not bytes. A new reset leaves the user's earlier ones valid until one is
  used.
- `go.mod` requires only `golang.org/x/crypto` v0.57.0, which needs exactly the `x/sys`, `x/net` and `x/text` versions
  the workspace already uses. `packages/virtual` and `packages/store` resolve through the workspace without
  `require` lines, as in `packages/virtual`.

Beyond the steps:

- Added `packages/auth/README.md`.
- `packages/virtual`: `get` and `getOr` became generic methods of `Settings`. This follows the Go 1.27
  `generic_methods` guideline that p0-13 missed; the virtual tests still pass.

Open:

- The client IP is the connection's peer. Behind a reverse proxy every request has the proxy's IP, so IP throttling
  and IP bans would hit everyone. Trusting `X-Forwarded-For` needs the user's decision.
- The last holder of `housekeeping.accessGroups` is guarded in HK-A, where access groups are edited.
- SSO tickets are built with the deferred client page ([0013](/decisions/0013-defer-game-server-features.md)).
- Limits come from the settings getters, such as `s.GetInt("auth.rememberDays")` and
  `s.GetBool("auth.secureCookies")` ([0024](/decisions/0024-settings-catalogue-and-getters.md)).
