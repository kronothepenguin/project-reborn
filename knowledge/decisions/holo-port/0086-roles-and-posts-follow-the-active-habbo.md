---
type: Decision
title: Group roles and forum posts belong to the active habbo
description: A group's tools, joining, leaving and the favourite act for the active habbo only, and only its posts count as the user's own on the forum.
status: accepted
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
tags: [groups, forum, habbos, p5]
---

# Decision

- A group's tools show only while the habbo holding the role is active: the owner's Settings, and the admins'
  Modify page, Badge and Members.
- Joining, requests, leaving and the favourite act for the active habbo.
- On the forum, the user's own posts are the active habbo's: only those show Modify and delete to their author, and
  only those hide the report flag. `forum.edit` works as before.
- To manage the group or the posts of another of their habbos, a user switches to that habbo.

# Context

[0065](/decisions/holo-port/0065-owners-edit-all-their-homes.md) lets a user edit the homes of all their habbos and left group
homes to P5. Asked whose group roles and posts count when a user owns several habbos, the user chose the active
habbo's: each page shows one habbo's view, and nothing public shows that two habbos are one person.
