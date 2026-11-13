---
type: Reference
title: Login
description: The steps of a sign-in by habbo name, its throttle and the ban check.
---

# Login

`Login(w, r, db, habboName, password, remember)` takes these steps:

1. It refuses with `ErrThrottled` when the IP, and then the habbo's user, reached `auth.loginMaxFailures` failed
   attempts within `auth.loginWindowMinutes`. Throttled attempts are not recorded.
2. It finds the habbo case-insensitively and checks the owner's password (decision holo-port/0002). An unknown habbo
   and a wrong password both give `ErrInvalidCredentials` after the same argon2 work.
3. Only once the password is right, it refuses an active ban on the user or the IP with a `*BanError`, which matches
   `ErrBanned`.
4. It records every attempt in `login_attempts`, starts the session with the named habbo active and sets the cookie.
   It also makes an SSO ticket for the game, best-effort.

# Bans

`ActiveBan(ctx, db, userID, ip)` returns the ban in force on the user or the IP, or nil. An IP ban skips a holder of
`housekeeping.access`, so a moderator cannot lock an administrator out through their address.
