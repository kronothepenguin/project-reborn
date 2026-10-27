---
type: SQL Query
title: users.query.sql
description: User operations for creation, lookup by id or email, and registrations per IP.
resource: packages/store/queries/users.query.sql
tags: [store, query, identity]
timestamp: 2026-10-27T21:44:59+00:00
---

# Operations

## CreateUser

- Cardinality: `:one`
- Inputs: `email`, `born_on`, `newsletter`, `created_ip`, `created_at`, `updated_at`
- Result: the created `User` (`RETURNING *`); a conflict when the email exists, ignoring case
- Tables: `users`

## GetUser

- Cardinality: `:one`
- Inputs: `id`
- Result: `User`
- Tables: `users`

## GetUserByEmail

- Cardinality: `:one`
- Inputs: `email` (matched ignoring case)
- Result: `User`; not found for an unknown email
- Tables: `users`

## CountUsersCreatedFromIP

- Cardinality: `:one`
- Inputs: `created_ip`, `since`
- Result: registrations from the IP since `since` (the `registration.maxPerIp` limit)
- Tables: `users`

# Related

- Entity: [User](/entities/user.md).
