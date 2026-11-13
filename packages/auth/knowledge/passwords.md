---
type: Reference
title: Passwords
description: How passwords are hashed, verified, rehashed, checked for length and changed.
---

# Passwords

Passwords are argon2id PHC strings (decision holo-port/0005).

- `HashPassword(password)` hashes with argon2id (m=19456 KiB, t=2, p=1, 16-byte salt, 32-byte key) into a PHC string,
  `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`.
- `VerifyPassword(hash, password)` compares in constant time; its error reports a malformed hash, never a wrong
  password.
- `NeedsRehash(hash)` reports a hash made with other parameters; `Login` rehashes such a hash after a successful login.
- `ValidatePassword(password)` checks a new password's length in characters against `auth.passwordMinLength` and
  `auth.passwordMaxLength` and wraps `ErrPasswordLength`.
- `CheckPassword(ctx, db, userID, password)` reports whether a password is the user's.
- `ChangePassword(w, r, db, password)` sets a new one, keeps the request's session under a new token, and ends every
  other session and open reset of the user (decision holo-port/0059).
