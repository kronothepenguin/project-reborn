---
type: Decision
title: Housekeeping components have one look each
description: Each housekeeping component looks the same on every page, with blue navigation, gold data lists, blue forms and a grey top bar.
status: accepted
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [housekeeping, design]
---

# Decision

| Component | Look |
| --- | --- |
| Tabs | Navy, the active one `sky-700` |
| Left navigation boxes | Always a `sky-700` title |
| Data lists in the content | `amber-300` header, `amber-100` rows |
| Forms and notes in the content | `sky-700` title, plain rows |
| Top bar | `olive-200`, as in `docs/hk.png` |

- Every page has a `Log out` link and the clock box.
- The extra tools in the user's screenshots are a reference for the look only.
- The rest of [0041](/decisions/0041-housekeeping-design-system.md) stands.

# Context

The user shared Sulake's housekeeping screenshots, in `HabboStaffDocs` on h4bbo.net, and answered: "not different styles
per page, different styling per components, as i saw, there are the nav always blue and some of the cards in the content
with gold...", then "yes" to this table.

# Consequences

- `tools/tw-color` gave these classes. `#0066cc` and `#006daa` both map to `sky-700`, `#ffcc00` to `amber-300` and
  `#ffeeaa` to `amber-100`.
- `Log out` needs a route, because the session is shared with the CMS.
