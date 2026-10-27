---
type: Decision
title: Login with habbo name and password
description: The login box takes a habbo name and the owning user's password; the named habbo becomes the active one.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [identity, auth]
---

# Decision

- The login form asks for a habbo name and a password.
- The name is matched case-insensitively (`avatars.name COLLATE NOCASE`); the password is checked against the
  owning user's credentials.
- On success the session's active habbo is the named one.

# Context

Holo logged in by `users.name` only. The existing `packages/cms/src/pages/index.astro` already labels the field
"Username".

# Consequences

- Email is never a login identifier; it is used for password resets
  ([0018](/decisions/0018-password-reset-by-email.md)).
