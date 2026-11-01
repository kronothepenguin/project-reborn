---
type: SQL Query
title: staff-logs.query.sql
description: Staff log operations to write a row, count the rows and list them newest first with the names of the actor and the target.
resource: packages/store/queries/staff-logs.query.sql
tags: [store, query, moderation]
timestamp: 2026-11-01T21:25:53+00:00
---

# Operations

## CreateStaffLog

- Cardinality: `:exec`
- Inputs: `user_id`, `target_user_id` and `target_avatar_id` (all nullable), `action`, `detail`, `ip`, `created_at`
- Tables: `staff_logs`

## CountStaffLogs

- Cardinality: `:one`
- Inputs: none
- Result: the number of rows
- Tables: `staff_logs`

## ListStaffLogs

- Cardinality: `:many`
- Inputs: `row_limit`, `row_offset`
- Result: `ListStaffLogsRow`, newest first: the row, `user_name` and `target_name`
- A user has no name of their own, so `user_name` is that of the user's first habbo. `target_name` is that of the target
  habbo, or of the target user's first habbo. Each is empty once the user or the habbo is gone.
- Tables: `staff_logs`, `avatars`

# Related

- Entity: [Staff log](/entities/staff-log.md).
