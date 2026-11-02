---
type: SQL Query
title: auth.query.sql
description: Sign-in operations for the habbo-name login lookup, credentials, sessions, login attempts and password resets.
resource: packages/store/queries/auth.query.sql
tags: [store, query, auth]
timestamp: 2026-11-02T02:47:29+00:00
---

# Operations

## GetLoginByHabboName

- Cardinality: `:one`
- Inputs: `name` (matched ignoring case)
- Result: `GetLoginByHabboNameRow` (avatar id, user id, habbo name, password hash); not found for an archived habbo or an unknown name
- Tables: `avatars`, `credentials`

## GetCredential

- Cardinality: `:one`
- Inputs: `user_id`
- Result: the user's password hash
- Tables: `credentials`

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
- Result: 1 when the habbo belongs to the session's user and is not archived, 0 otherwise (nothing changes)
- Tables: `sessions`, `avatars`

## MoveAvatarSessions

- Cardinality: `:exec`
- Inputs: `to_avatar_id`, `avatar_id`
- Result: moves the sessions open on a habbo to another one, when it is archived
- Tables: `sessions`

## DeleteSession

- Cardinality: `:exec`
- Inputs: `id`
- Tables: `sessions`

## DeleteUserSessions

- Cardinality: `:exec`
- Inputs: `user_id`
- Result: ends every session of the user (ban, password reset, password change)
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
- Run by `auth.DeleteExpiredSessions`, on the scheduler
- Tables: `sessions`

## CreateLoginAttempt

- Cardinality: `:exec`
- Inputs: `user_id` and `avatar_id` (NULL for an unknown habbo name), `ip`, `succeeded`, `created_at`
- Tables: `login_attempts`

## GetPreviousLogin

- Cardinality: `:one`
- Inputs: `user_id`
- Result: `GetPreviousLoginRow` (`ip`, `created_at`) of the user's sign-in before the newest; not found for a first
  sign-in
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

## GetLastSignIn

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: when the habbo last signed in; not found when it never did
- Tables: `login_attempts`

## GetLastSeen

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: when a session of the habbo last did something; not found without a session
- Tables: `sessions`

## ListUserLogins

- Cardinality: `:many`
- Inputs: `user_id`, `row_limit`
- Result: the addresses and times of the user's sign-ins, newest first, for the clone checker
- Tables: `login_attempts`

## GetResetAccount

- Cardinality: `:one`
- Inputs: `name`, `email`, both ignoring case
- Result: the user's id and address with the habbo's name as stored, when the habbo belongs to the account of that
  address; not found otherwise
- Tables: `avatars`, `users`

## CreatePasswordReset

- Cardinality: `:execrows`
- Inputs: `id` (token digest), `user_id`, `created_at`, `expires_at`, `max_active`
- Result: 1 when the row went in, 0 when the user already holds `max_active` unexpired resets. One statement counts and
  inserts, so that requests at the same moment cannot pass the limit together
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
- Run by `auth.DeleteExpiredResets`, on the scheduler
- Tables: `password_resets`

# Related

- Entities: [Credential](/entities/credential.md), [Session](/entities/session.md).
