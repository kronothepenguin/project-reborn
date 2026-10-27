---
type: Decision
title: Native SQLite date and boolean types
description: Columns use DATETIME for instants, DATE for birth dates and BOOLEAN with TRUE/FALSE instead of unix-second integers and 0/1.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [store, sqlite]
---

# Decision

- `DATETIME` for every `*_at` column, always written from Go as a UTC `time.Time`. With `_time_format=sqlite`,
  modernc writes `2006-01-02 15:04:05.999999999-07:00`.
- Queries never use `CURRENT_TIMESTAMP`, so stored strings share one format and compare correctly.
- `DATE` for `users.born_on`.
- `BOOLEAN` with `TRUE`/`FALSE` (stored as 1/0).
- No `TIME` columns: sqlc does not map them.

# Context

Checked in the module cache:

- sqlc v1.31.1 (`internal/codegen/golang/sqlite_type.go`) maps `date`, `datetime` and `timestamp` to `time.Time`
  (`sql.NullTime` when nullable) and `boolean`/`bool` to `bool`.
- modernc.org/sqlite v1.58.0 parses declared DATE/DATETIME/TIMESTAMP columns into `time.Time` and by default
  writes `t.String()` (`conn.go`, `formatTime`); `_time_format=sqlite` selects the SQLite format.

# Consequences

- `adding-data-persistence` replaces its "unix seconds" and "0/1" rules
  ([p0-03](/tasks/p0-03-persistence-skill-updates.md)).
