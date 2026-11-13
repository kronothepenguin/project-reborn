---
type: Decision
title: Reset mail is limited per account
description: An account can hold auth.resetMaxActive unexpired reset links at a time, so nobody can make the hotel send repeated mail to one address.
status: accepted
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [auth, security]
---

# Decision

- `POST /forgot` sends no mail while the account already holds `auth.resetMaxActive` unexpired reset links.
- `auth.resetMaxActive` is a setting, 3 by default. A link lives for `auth.resetTokenMinutes`, so at most that many mails
  go out in that time.
- The page answers the same way when the limit stops a mail, as
  [0018](/decisions/0018-password-reset-by-email.md) requires.

# Context

Holo let anyone send repeated mail to one address. The agent recommended a limit per address, and the user answered
"yes limit". The name of the setting and its default are the agent's, and can change without a new decision.

# Consequences

- A person who loses a mail waits until a link expires once the limit is reached.
