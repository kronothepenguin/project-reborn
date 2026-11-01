---
type: Decision
title: Expired reset links are deleted when they expire
description: A reset link works for auth.resetTokenMinutes, 60 by default, and a scheduled task deletes it at that age, so that the account can ask for a new one.
status: accepted
timestamp: 2026-11-01T19:50:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:50:41+00:00"}
tags: [auth, scheduler]
---

# Decision

- A reset link works for `auth.resetTokenMinutes`, 60 by default, and is deleted at that age.
- A task on the [scheduler](/decisions/0043-scheduler.md) does the deleting. `auth.resetTokenMinutes` is the only setting.
- Requesting a reset no longer deletes expired links; the task is the one place that does.

# Context

The user first asked for deletion after a configurable period, 24 hours by default. Offered a link that works for 60
minutes and is deleted at 24 hours, or one that works for the full 24, the user answered: "works 60 min, deleted at
60min, i though i wasn't deleted". Until now expired links stayed in the table until someone's next reset request.

# Consequences

- The limit of [0035](/decisions/0035-reset-mail-limit.md) stays as it is: expired links never counted against it.
