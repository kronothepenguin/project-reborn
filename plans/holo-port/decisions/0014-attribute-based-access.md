---
type: Decision
title: Attribute-based access control
description: Admin-defined access groups carry attributes that belong to the user, and code checks attributes only, never a rank number or a group name.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [auth, access, housekeeping]
---

# Decision

- `access_groups` (any number, named, with a `staff_listed` flag) carry `access_group_attributes`. Users join
  through `access_group_members`, which also records a display habbo for the staff page.
- A user's attributes are the union of their groups' attributes. Code asks `auth.Attributes(ctx, userID)` or uses
  `auth.RequireAttribute(attr)`.
- Attributes cover security and the permission to modify things, and they belong to the user. Club membership and
  similar perks are properties of the habbo.
- The last holder of `housekeeping.accessGroups` cannot lose it.
- The installer creates an "Administrators" group with every attribute.

# Context

Holo used numeric ranks 1–7: rank 2 meant Habbo Club, staff checks were `rank > 5` or `rank == 7`, a hard-coded
`$sysadmin` user id held the dangerous tools, and the rank titles disagreed between files.

# Consequences

- Names and the initial catalogue: [0015](/decisions/0015-attribute-names-and-fuses.md).
- Staff page: [0019](/decisions/0019-staff-page-display-habbo.md).
