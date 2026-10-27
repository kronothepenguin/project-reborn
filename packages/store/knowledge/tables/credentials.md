---
type: SQLite Table
title: credentials
description: One argon2id password hash per user, stored as a PHC string.
resource: packages/store/schema/auth.schema.sql
tags: [store, table, auth]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `user_id` | INTEGER | no | | Owner of the password | primary key, → `users.id` ON DELETE CASCADE |
| `password_hash` | TEXT | no | | `$argon2id$v=19$m=…,t=…,p=…$<salt>$<hash>` | |
| `updated_at` | DATETIME | no | | Last password change or rehash (UTC) | |

# Keys

- Primary key `user_id`.

# Related

- Entity: [Credential](/entities/credential.md).
