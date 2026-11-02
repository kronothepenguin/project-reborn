---
type: Decision
title: Staff levels
description: Each access group has a level, staff act only on users below them, IP bans skip housekeeping staff, and a banned user in housekeeping goes to the CMS.
status: accepted
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [access, moderation]
---

# Decision

- Each access group has a `level`, Holo's rank number for the installer's groups. A user's level is the highest of their
  groups, and 0 without a group. Direct attributes do not change it.
- Attributes say what a user can do, and the level says who they can do it to.
- Banning, editing, credits, badges, archiving and direct attributes work only on users strictly below the actor.
- Nobody can edit a group above their level, add someone to it, or set a level above their own.
- A refusal writes a staff log row, as Holo's did.
- IP bans do not apply to holders of `housekeeping.access`.
- A banned user who opens housekeeping goes to `site.url`, where the CMS ends the session and shows Holo's ban message.

# Context

Holo protected one account, `$sysadmin`, so a moderator could ban every other administrator, and an IP ban could stop
anyone on that address. The user asked: "i just think in a situation where a mod tries to ban the admin, how we can
prevent that?", and answered "yes" to this design. Offered Holo's ban message for housekeeping, the user answered "yes".

# Consequences

- The top level cannot be banned through housekeeping. To ban an administrator, another administrator first takes them
  out of the group, and the guard keeps that from removing the last manager.
- `/housekeeping/` no longer answers 403 to a banned user.
