---
type: SQL Schema File
title: auth.schema.sql
description: Declares the authentication tables for credentials, sessions, login attempts, password resets and SSO tickets.
resource: packages/store/schema/auth.schema.sql
tags: [store, schema, auth]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [credentials](/tables/credentials.md) | table | One argon2id password hash per user |
| [sessions](/tables/sessions.md) | table | Signed-in browsers and their active habbo |
| `idx_sessions_user_id`, `idx_sessions_avatar_id` | indexes | Sessions of a user or a habbo |
| `idx_sessions_expires_at` | index | Purging expired sessions |
| [login_attempts](/tables/login_attempts.md) | table | Every login attempt, for throttling and IP history |
| `idx_login_attempts_ip_created_at`, `idx_login_attempts_user_id_created_at`, `idx_login_attempts_avatar_id_created_at` | indexes | Attempts per IP, user or habbo within a window |
| [password_resets](/tables/password_resets.md) | table | Single-use, expiring reset tokens |
| `idx_password_resets_user_id` | index | Resets of a user |
| [sso_tickets](/tables/sso_tickets.md) | table | One-time game-client login tickets (API deferred) |
| `idx_sso_tickets_avatar_id` | index | Tickets of a habbo |

Entities: [Credential](/entities/credential.md), [Session](/entities/session.md).
