---
type: Decision
title: Attributes on groups and on users
description: A user holds the attributes of their access groups and those given to them directly, private user data takes its own attribute, and the guard needs one user holding both keys.
status: accepted
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [access, auth]
---

# Decision

- A user's attributes are those of their access groups plus those given to the user directly. `auth.Attributes` returns
  both, and every check reads it.
- Holders of `housekeeping.accessGroups` give direct attributes, on the user page of
  [HK-B](/phases/hk-b-users-moderation.md).
- `housekeeping.users` is now finding a habbo and reading its profile. A new `housekeeping.usersPrivate` is emails and
  IP history.
- After any change at least one user must hold both `housekeeping.access`, which enters housekeeping, and
  `housekeeping.accessGroups`, which manages access. Each can come from any group or directly.
- The rest of [0014](/decisions/0014-attribute-based-access.md) and of
  [0015](/decisions/0015-attribute-names-and-fuses.md) stands, except for what
  [0054](/decisions/0054-access-groups-are-holos-ranks.md) and
  [0056](/decisions/0056-wallet-club-and-inventory-per-user.md) change.

# Context

Supersedes [0014](/decisions/0014-attribute-based-access.md), where attributes came only from groups and the guard named
one attribute, and [0015](/decisions/0015-attribute-names-and-fuses.md), where `housekeeping.users` included emails. The
user answered: "i want both, group attributes and user attributes, in my mind we can trust a moderator enough to give
them an extra permission, as example to get extra user info, or ban." On the guard, once told that the last manager
losing `housekeeping.accessGroups` would leave nobody able to repair access: "got it, guard both". The split of
`housekeeping.users` was proposed for that example, and the user answered "ok".

# Consequences

- A new table holds direct attributes.
- The dashboard's addresses take `housekeeping.usersPrivate`.
