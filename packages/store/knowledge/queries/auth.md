---
type: SQL Query
title: auth.query.sql
description: Sign-in operations for the habbo-name login lookup, credentials, sessions, login attempts and password resets.
resource: packages/store/queries/auth.query.sql
tags: [store, query, auth]
timestamp: 2026-10-27T21:44:59+00:00
---

# Operations

## GetLoginByHabboName

- Cardinality: `:one`
- Inputs: `name` (matched ignoring case)
- Result: `GetLoginByHabboNameRow` (avatar id, user id, habbo name, password hash); not found for an unknown name
- Tables: `avatars`, `credentials`

## UpsertCredential

- Cardinality: `:exec`
- Inputs: `user_id`, `password_hash`, `updated_at`
- Result: inserts or replaces the user's hash
- Tables: `credentials`

## CreateSession

- Cardinality: `:exec`
- Inputs: `id` (token digest), `user_id`, `avatar_id`, `remember`, `ip`, `user_agent`, `created_at`,
  `last_seen_at`, `expires_at`
- Tables: `sessions`

## GetActiveSession

- Cardinality: `:one`
- Inputs: `id`, `now`
- Result: `Session` when `expires_at > now`; not found otherwise
- Tables: `sessions`

## TouchSession

- Cardinality: `:exec`
- Inputs: `id`, `last_seen_at`, `expires_at`
- Tables: `sessions`

## SwitchSessionAvatar

- Cardinality: `:execrows`
- Inputs: `id`, `avatar_id`
- Result: 1 when the habbo belongs to the session's user, 0 otherwise (nothing changes)
- Tables: `sessions`, `avatars`

## DeleteSession

- Cardinality: `:exec`
- Inputs: `id`
- Tables: `sessions`

## DeleteUserSessions

- Cardinality: `:exec`
- Inputs: `user_id`
- Result: ends every session of the user (ban, password reset)
- Tables: `sessions`

## DeleteOtherUserSessions

- Cardinality: `:exec`
- Inputs: `user_id`, `keep_id`
- Result: ends every other session of the user (password change)
- Tables: `sessions`

## PurgeExpiredSessions

- Cardinality: `:execrows`
- Inputs: `now`
- Result: number of sessions deleted with `expires_at <= now`
- Tables: `sessions`

## CreateLoginAttempt

- Cardinality: `:exec`
- Inputs: `user_id` and `avatar_id` (NULL for an unknown habbo name), `ip`, `succeeded`, `created_at`
- Tables: `login_attempts`

## CountFailedLoginsByIP

- Cardinality: `:one`
- Inputs: `ip`, `since`
- Result: failed attempts from the IP since `since`
- Tables: `login_attempts`

## CountFailedLoginsByUser

- Cardinality: `:one`
- Inputs: `user_id`, `since`
- Result: failed attempts on the user's habbos since `since`
- Tables: `login_attempts`

## CreatePasswordReset

- Cardinality: `:exec`
- Inputs: `id` (token digest), `user_id`, `created_at`, `expires_at`
- Tables: `password_resets`

## GetActivePasswordReset

- Cardinality: `:one`
- Inputs: `id`, `now`
- Result: `PasswordReset` when `expires_at > now`; not found otherwise
- Tables: `password_resets`

## DeleteUserPasswordResets

- Cardinality: `:exec`
- Inputs: `user_id`
- Result: removes every reset of the user (a token works once)
- Tables: `password_resets`

## PurgeExpiredPasswordResets

- Cardinality: `:execrows`
- Inputs: `now`
- Result: number of resets deleted with `expires_at <= now`
- Tables: `password_resets`

# Related

- Entities: [Credential](/entities/credential.md), [Session](/entities/session.md).
