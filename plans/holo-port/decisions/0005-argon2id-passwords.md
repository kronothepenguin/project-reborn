---
type: Decision
title: Passwords hashed with argon2id
description: Passwords are hashed with argon2id from golang.org/x/crypto and stored as PHC strings that carry their parameters.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [auth, security]
---

# Decision

- `golang.org/x/crypto/argon2`; Go 1.27's standard library has neither argon2 nor bcrypt.
- Stored as `$argon2id$v=19$m=…,t=…,p=…$<salt>$<hash>` in `credentials.password_hash`.
- Parameters are constants in `packages/auth` (OWASP: m=19456 KiB, t=2, p=1). A stored hash with older parameters
  is rehashed after a successful login.

# Context

Holo used `md5("235x17aXCaRb" . password)` with inconsistent escaping before hashing
(`source/holo/includes/inc.crypt.php`).
