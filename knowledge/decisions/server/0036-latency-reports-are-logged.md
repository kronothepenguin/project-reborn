---
type: Decision
title: Latency reports are only logged
description: The client's REPORT_LATENCY is written to the server's log, and nothing of it is saved.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, data]
---

# Decision

- `REPORT_LATENCY` (316) is written to the server's log, and nothing of it is saved.

# Context

Offered logging or saving them, the user chose "Logged only (Recommended)": "The server writes them to its log and
keeps nothing."

# Consequences

- s2-08 logs them.
