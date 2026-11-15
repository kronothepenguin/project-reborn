---
type: Decision
title: Error reports wait for S7
description: The client sends no error report, and the server sends no 299 in S2: a command the server cannot answer is logged and closes the session, and S7 decides when the server reports an error.
status: accepted
timestamp: 2026-11-10T02:46:53+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:46:53+00:00"}
tags: [server, errors]
---

# Decision

- The server sends no 299 in S2. A command it cannot answer, on a failure of the database, is logged and closes the
  session, as s2-06 and s2-07 do.
- S7, whose scope lists error reports, decides when the server sends one.

# Context

s2-08 had a step to log `hh_shared`'s error reports, but the client
sends none: it only receives 299 with an error id, a message id and a time, and shows them in its error window
(hh_shared (`packages/server/knowledge/r26/hh_shared.md#error-reports`)). Offered leaving them to S7, or sending 299 when a handler
fails, the user chose "Leave them to S7 (Recommended)": "Drop the step from s2-08: the server sends no 299 yet, and a
command it cannot answer is logged and closes the session, as now. S7, whose scope lists error reports, decides when
the server reports one."

# Consequences

- s2-08 drops its step on error reports.
