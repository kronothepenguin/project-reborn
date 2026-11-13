---
type: Reference
title: Login
description: The steps of a sign-in by habbo name, its throttle and the ban check.
---

# Login

`Login(w, r, db, habboName, password, remember)` takes these steps:

1. It refuses with `ErrThrottled` when the IP reached `auth.loginMaxFailures` failed attempts within
   `auth.loginWindowMinutes`.
2. It finds the habbo case-insensitively (decision holo-port/0002). An unknown habbo runs argon2 on a fixed hash and
   gives `ErrInvalidCredentials`, as slow as a wrong password.
3. It refuses with `ErrThrottled` when the habbo's user reached the same limit.
4. It checks the owner's password, and a wrong one gives `ErrInvalidCredentials`.
5. Only once the password is right, it refuses an active ban on the user or the IP with a `*BanError`, which matches
   `ErrBanned`.
6. It starts the session with the named habbo active, sets the cookie, and makes an SSO ticket for the game,
   best-effort.

Every attempt goes in `login_attempts`. A banned attempt counts as a failure, and a throttled one stays unrecorded.

# Bans

`ActiveBan(ctx, db, userID, ip)` returns the ban in force on the user or the IP, or nil. An IP ban skips a holder of
`housekeeping.access`, so a moderator cannot lock an administrator out through their address.
