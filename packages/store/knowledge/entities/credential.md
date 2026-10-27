---
type: Entity
title: Credential
description: A user's argon2id password hash and the single-use tokens that reset it.
tags: [store, entity, auth]
timestamp: 2026-10-27T21:17:19+00:00
---

# Definition

The secret a user signs in with, plus the outstanding password-reset tokens.

# Invariants

- One password hash per user, as an argon2id PHC string (`$argon2id$v=19$m=…,t=…,p=…$<salt>$<hash>`).
- Reset ids are SHA-256 digests of the emailed token; the token itself is never stored.
- A reset token works once and only before `expires_at`.

# Lifecycle

- The hash is written at registration and replaced on a password change or a reset; both end every other session.
- After a successful login, a hash with older argon2id parameters is rehashed.
- A reset row is created by the forgot-password form and deleted when used or expired.

# Vocabularies

None.

# Relations

- Belongs to a [user](/entities/user.md).

# Tables

- [credentials](/tables/credentials.md)
- [password_resets](/tables/password_resets.md)

# Queries

- [auth.query.sql](/queries/auth.md)
