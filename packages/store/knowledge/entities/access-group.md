---
type: Entity
title: Access group
description: An admin-defined group of users that grants attributes; code checks attributes, never group names.
tags: [store, entity, access]
timestamp: 2026-10-27T21:17:19+00:00
---

# Definition

Attribute-based access control: an access group carries attributes, and a user holds the union of the attributes
of every group they belong to. Attributes cover security and the permission to modify things; club perks are habbo
properties, not attributes.

# Invariants

- The group name is unique, ignoring case.
- A member's display habbo is one of the member's own habbos (enforced by the application).
- The last user holding `housekeeping.accessGroups` cannot lose it (enforced by the application).

# Lifecycle

- The installer creates "Administrators" with every attribute and `staff_listed`, and adds the first administrator.
- Housekeeping creates groups, toggles attributes and adds or removes members with a display habbo.
- Deleting a group deletes its attributes and memberships.

# Vocabularies

`access_group_attributes.attribute` takes values from the catalogue in `packages/auth`:

| Attribute | Grants |
|-----------|--------|
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

R26 fuses (`fuse_*`) are a separate catalogue, designed with the game server.

# Relations

- Members are [users](/entities/user.md); each membership may name a display [habbo](/entities/habbo.md).

# Tables

- [access_groups](/tables/access_groups.md)
- [access_group_attributes](/tables/access_group_attributes.md)
- [access_group_members](/tables/access_group_members.md)

# Queries

- [access.query.sql](/queries/access.md)
