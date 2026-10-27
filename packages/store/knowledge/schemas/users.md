---
type: SQL Schema File
title: users.schema.sql
description: Declares the users table, the person behind one or more habbos.
resource: packages/store/schema/users.schema.sql
tags: [store, schema, identity]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [users](/tables/users.md) | table | The person: email, birth date, newsletter opt-in, registration IP |
| `idx_users_email` | unique index | One user per email, ignoring case |
| `idx_users_created_ip_created_at` | index | Registrations per IP within a window |

Entity: [User](/entities/user.md).
