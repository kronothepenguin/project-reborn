---
type: Decision
title: One user owns many habbos
description: A user is the person; credentials and sessions belong to the user and a session records the active habbo.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [identity, store, auth]
---

# Decision

- `users` is the person: email, birth date, newsletter opt-in, registration IP.
- `avatars` are habbos. `avatars.user_id` is not unique, so one user owns many habbos.
- Credentials (`credentials`) and sessions (`sessions`) belong to the user; `sessions.avatar_id` is the active habbo.
- Registration creates the user and the first habbo. More habbos are added from Account → Habbos, limited by
  `registration.maxHabbosPerUser`.

# Context

Holo's `users` row mixed login, contact data, in-game identity, web profile, moderation and presence, and every
habbo was its own account. The user asked to split what a user, a habbo, auth and a profile are into separate
tables.

# Consequences

- Login names a habbo ([0002](/decisions/0002-login-with-habbo-name.md)).
- Bans apply to the person, so to all of their habbos.
- Profiles hang off habbos ([0006](/decisions/0006-profiles-per-habbo.md)); access attributes hang off users
  ([0014](/decisions/0014-attribute-based-access.md)).
- The signed-in header has a habbo switcher.
