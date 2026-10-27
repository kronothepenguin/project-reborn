---
type: Decision
title: Dotted attribute names; fuses stay separate
description: Web attributes use dotted names such as forum.edit, while R26 fuses keep their exact fuse_* names in a separate, deferred catalogue.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [auth, access]
---

# Decision

- Attribute names are dotted lowerCamelCase: `housekeeping.news`, `forum.edit`, `site.maintenanceBypass`.
- The catalogue (name and description) lives in `packages/auth`; housekeeping shows it as checkboxes.
- R26 fuses (`fuse_*`) are what the client expects, so they keep their exact names in a separate catalogue designed
  together with the game server.

Initial catalogue:

| Attribute | Grants |
| --- | --- |
| `housekeeping.access` | entering housekeeping |
| `housekeeping.settings` | editing settings, including maintenance |
| `housekeeping.accessGroups` | managing access groups and their members |
| `housekeeping.news` | writing and deleting news |
| `housekeeping.banners` | managing banners |
| `housekeeping.homeStore` | managing the home store catalogue |
| `housekeeping.users` | searching users and habbos, seeing emails and IP history |
| `housekeeping.usersEdit` | editing users, habbos and badges |
| `housekeeping.credits` | giving or taking credits |
| `housekeeping.vouchers` | creating vouchers |
| `housekeeping.bans` | banning and lifting bans |
| `housekeeping.alerts` | alerting one habbo |
| `housekeeping.alertsBroadcast` | alerting everyone |
| `housekeeping.help` | handling help tickets |
| `housekeeping.logs` | reading the staff log |
| `site.maintenanceBypass` | using the site during maintenance |
| `forum.edit` | editing, deleting, locking or pinning any thread or post |
| `homes.staffItems` | the staff store category and the staff skin |

# Context

The user asked whether web attributes should look like fuses (`fuse_forum_view`). Dotted names were preferred, and
fuses cannot be renamed because the client already uses them.
