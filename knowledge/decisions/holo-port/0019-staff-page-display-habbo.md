---
type: Decision
title: Staff page shows display habbos
description: /staff lists access groups flagged staff_listed and shows, for each member, the display habbo chosen when access was granted.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [cms, access]
---

# Decision

- Access groups have a `staff_listed` flag.
- When an admin adds a user to an access group, they pick one of that user's habbos as display habbo
  (`access_group_members.display_avatar_id`).
- `/staff` lists the listed groups and their members' display habbos, plus the `staffPage.*` text boxes.

# Context

Access is per user, but the staff page shows habbos (avatar, motto, badge). Listing every habbo of a staff user
would expose their personal habbos.
