---
type: Reference
title: Sessions
description: The session cookie, its expiry, the middleware that reads it, sign-out, habbo switching and SSO tickets.
---

# Sessions

- The cookie `reborn_session` holds 32 random bytes in base64url: HttpOnly, SameSite=Lax, `Secure` from
  `auth.secureCookies`, Path `/`. Only a remember-me cookie carries a Max-Age. The name has no `__Host-` prefix,
  because that prefix needs `Secure` and `auth.secureCookies` can be false.
- The database keeps only the SHA-256 digest of the token, as `sessions.id`.
- A session ends after `auth.sessionIdleMinutes` without requests, a remembered one after `auth.rememberDays`.
  `Sessions` slides the expiry forward, writing at most once a minute, and renews the cookie of a remembered session.
- `Sessions(db)` returns the middleware that puts the session in the context for `FromContext(ctx) (Session, bool)`
  and clears a cookie without an active session.
- `RequireSession(next)` redirects a page to `/` and answers 401 when the request's `Accept` header names
  `application/json`.
- `RequireAttribute(db, attr)` answers 403 to a user without `attr`.
- `DeleteExpiredSessions(ctx, db)` removes the sessions past their expiry. Every program that serves sessions runs it on
  the scheduler (decision holo-port/0050).
- `Logout(w, r, db)` ends the cookie's session, `LogoutEverywhere(ctx, db, userID)` every session of a user, and
  `SwitchHabbo(ctx, db, avatarID)` changes the active habbo (`ErrNotOwner` for another user's habbo).
- `SSOTicket(r, db)` returns the SSO ticket of the session's active habbo, making one when it holds none. The game
  server spends a ticket at login, and `SwitchHabbo` drops the session's tickets (decision server/0030).

# Gotchas

- `RequireSession`, `RequireAttribute`, `SwitchHabbo`, `ArchiveHabbo` and `SSOTicket` read the session that `Sessions`
  put in the context, so `Sessions` must wrap them.
- JSON callers send `Accept: application/json` to get 401 instead of a redirect.
