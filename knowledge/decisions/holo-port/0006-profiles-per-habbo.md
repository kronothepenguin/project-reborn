---
type: Decision
title: Profiles belong to each habbo
description: Each habbo has its own profile, which anchors its home page and its tags.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [identity, homes]
---

# Decision

- `profiles.avatar_id` is unique. The profile anchors the habbo's home (`/home/{name}`) and its `profile_tags`.
- A home belongs to exactly one profile or one group (`homes.profile_id` or `homes.group_id`, with a CHECK that
  exactly one is set).

# Context

Holo homes were per account and shared one polymorphic table with group homes (`groupid = -1` for user homes).
