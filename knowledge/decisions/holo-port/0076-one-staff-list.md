---
type: Decision
title: The staff page is one list, as Holo's
description: The staff page lists every member of the staff-listed groups once, sorted by habbo name, with the name of their highest listed group as rank and the habbo chosen for that group.
status: accepted
timestamp: 2026-11-04T01:26:49+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:26:49+00:00"}
tags: [cms, staff, access]
---

# Decision

- Every member of a group with `staff_listed` appears once, sorted by the name of the habbo shown.
- `Rank:` shows the member's highest listed group, by level, and the habbo shown is the one chosen for that group.
- The rest of [0019](/decisions/holo-port/0019-staff-page-display-habbo.md) stands.

# Context

Holo listed every user above rank 2 in one list sorted by name, each with `Rank: Administrator` and the like. Groups
replace ranks ([0054](/decisions/holo-port/0054-access-groups-are-holos-ranks.md)), and a user can sit in several. The user chose
"One list, as Holo" over a section per group.

# Consequences

- Someone in two listed groups shows once, under the higher group.
