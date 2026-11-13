---
type: Decision
title: Expired sessions are deleted on a schedule
description: A task on the scheduler deletes sessions once they expire, in place of the purge at sign-in.
status: accepted
timestamp: 2026-11-01T20:49:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:49:31+00:00"}
tags: [auth, scheduler]
---

# Decision

- A task on the [scheduler](/decisions/0043-scheduler.md) deletes sessions once they expire.
- Signing in no longer deletes them; the task is the one place that does.
- Every program that serves sessions registers the task, so that sessions go even when only one program runs.

# Context

Told that expired sessions stayed until someone's next sign-in, the user answered: "expired sesions should be deleted, it's
better to just delete them".

# Consequences

- `login_attempts` stays, because the throttle and housekeeping's IP history read it.
