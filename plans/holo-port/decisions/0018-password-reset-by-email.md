---
type: Decision
title: Password reset by email
description: Forgot password emails a single-use, expiring reset link built on password_resets and the mail settings.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [auth, mail]
---

# Decision

- `POST /forgot` answers the same way whether or not the email exists.
- `password_resets` stores the token digest and an expiry (`auth.resetTokenMinutes`); a token works once.
- Mail goes through `net/smtp` with `mail.host`, `mail.port`, `mail.username`, `mail.password` and `mail.from`.
- After a reset every session of the user ends.

# Context

Holo's `forgot.php` emailed the stored md5 hash, which nobody could use.
