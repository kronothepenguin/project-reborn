---
type: Task
title: Rewrite packages/auth
description: Replace the session-only library with argon2id passwords, habbo-name login with throttling and bans, sessions, middleware, attributes and password reset.
status: todo
phase: p0
depends_on: [p0-06, p0-08]
packages: [packages/auth]
holo: [source/holo/includes/inc.crypt.php, source/holo/index.php, source/holo/logout.php, source/holo/security_check.php, source/holo/forgot.php, source/holo/core.php]
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
---

# Goal

A shared auth package for cms, housekeeping and the installer, as described in
[0005](/decisions/0005-argon2id-passwords.md), [0014](/decisions/0014-attribute-based-access.md),
[0015](/decisions/0015-attribute-names-and-fuses.md) and [0018](/decisions/0018-password-reset-by-email.md).

# Steps

- [ ] Delete every file of the current `packages/auth`. The new `go.mod` requires `packages/virtual`,
      `packages/store` and `golang.org/x/crypto`.
- [ ] `New(db *sql.DB, s *virtual.Settings) *Auth`.
- [ ] Passwords: argon2id PHC hash, verify, needs-rehash (m=19456 KiB, t=2, p=1).
- [ ] `Login(w, r, habboName, password, remember)`:
  - throttling per IP and per user from `login_attempts`;
  - `ErrBanned` with reason and expiry;
  - rehash when needed;
  - the session cookie.
- [ ] Sessions:
  - 32 random bytes in the cookie, SHA-256 digest in the database;
  - HttpOnly, SameSite=Lax, Secure from `auth.secureCookies`;
  - Max-Age only for remember-me;
  - sliding expiry written at most once a minute.
- [ ] `Logout`, `LogoutEverywhere(userID)`, `SwitchHabbo(w, r, avatarID)`.
- [ ] Middleware `Sessions`, `RequireSession` (redirect for pages, 401 for JSON), `RequireAttribute`; `FromContext`.
- [ ] The `Attribute` type, the catalogue with descriptions, and `Attributes(ctx, userID)`.
- [ ] `CreateReset(ctx, email)` and `ResetPassword(ctx, token, password)`.
- [ ] Table tests on a temporary database: hash round trip, wrong password, throttle, ban, session and remember
      cookies, sliding expiry, habbo-switch ownership, reset single use and expiry, attribute union.

# Verification

```sh
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
```

# Notes

- SSO tickets are built with the deferred client page ([0013](/decisions/0013-defer-game-server-features.md)).
