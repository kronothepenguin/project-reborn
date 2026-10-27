---
type: Entity
title: Session
description: A signed-in browser of a user with its active habbo, together with the login-attempt history and game-client tickets.
tags: [store, entity, auth]
timestamp: 2026-10-27T21:17:19+00:00
---

# Definition

A session is a browser signed in as a user, acting as one of the user's habbos. Login attempts record every
sign-in try; SSO tickets hand a signed-in habbo to the game client (deferred until the game server exists).

# Invariants

- The session id is the SHA-256 digest of the cookie token; the token is never stored.
- The active habbo belongs to the session's user (enforced by the application).
- `expires_at` slides with activity; `last_seen_at` is written at most once a minute.
- Login attempts are never updated.
- SSO ticket ids are digests and a ticket is redeemed once.

# Lifecycle

- A sign-in records a login attempt (with `succeeded`) and, on success, creates a session.
- Failed attempts per IP and per user within `auth.loginWindowMinutes` decide throttling.
- Switching habbo changes `avatar_id`.
- A session is deleted on logout, password change, password reset, ban or expiry purge.

# Vocabularies

None.

# Relations

- Belongs to a [user](/entities/user.md) and acts as one of their [habbos](/entities/habbo.md).

# Tables

- [sessions](/tables/sessions.md)
- [login_attempts](/tables/login_attempts.md)
- [sso_tickets](/tables/sso_tickets.md)

# Queries

- [auth.query.sql](/queries/auth.md)
