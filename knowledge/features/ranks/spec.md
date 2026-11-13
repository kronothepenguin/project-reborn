---
type: Spec
title: Ranks
description: Access groups, Holo's ranks, give staff their attributes, levels and game fuses, and every change in housekeeping is written to the staff log.
status: done
projects: [packages/auth, packages/store, packages/installer, packages/housekeeping, packages/server]
---

# What

Staff rights come from access groups, Holo's ranks, and from attributes given to a user directly. A group carries
attributes, a level and the game's fuses. Attributes say what a user can do, and the level says who they can do it to.
The holders of `housekeeping.accessGroups` manage the groups in housekeeping, and the staff log records every change.

# Behaviours

## Entering housekeeping

- A guest opens any housekeeping page: they go to `site.url` to sign in (decision holo-port/0003).
- A signed-in user without `housekeeping.access` opens any housekeeping page or file: a plain 403 (decision
  holo-port/0053).
- Staff without a page's attribute open it: Holo's Access Denied page, in the layout, with 403.
- A banned user opens housekeeping: they go to `site.url`, where the CMS ends the session and shows Holo's ban message
  (decision holo-port/0055).
- Staff press Log out: the session they share with the site ends.

## Access groups

- A new hotel opens: it holds Holo's ranks as access groups, Administrator (level 7), Moderator (6), Gold Hobba (5),
  Silver Hobba (4) and HabboX (3), all listed on `/staff` (decision holo-port/0054).
- The installer creates the first administrator: they join Administrator, which holds every attribute (decision
  holo-port/0054).
- A holder of `housekeeping.accessGroups` creates a group with a free name: its page opens. A taken name is refused.
- The group page saves a checkbox for each attribute and each fuse, the `/staff` flag and a level from 0 to 99.
- A manager adds a user, found by a habbo's name or a user's id, under one of the user's own habbos as display habbo:
  the user is a member, and the display habbo can change later.
- A manager deletes a group with the confirmation box ticked: the group, its attributes and its members go. Without the
  box, the delete is refused (decision holo-port/0054).

## Attributes

- A user holds the attributes of their groups and the attributes given to them directly (decision holo-port/0053).
- A manager ticks attributes on a user's page: the ticks replace the user's direct attributes, and their groups stay as
  they are. Fuses come from groups only (decision holo-port/0053).
- Emails and IP history show to holders of `housekeeping.usersPrivate` only (decision holo-port/0053).

## Staff levels

- A user's level is the highest level of their groups, and 0 without a group (decision holo-port/0055).
- Staff edit a group, add or remove its members, or delete it, up to their own level. A group above is refused, and the
  refusal is logged (decision holo-port/0055).
- Staff set a level up to their own. A higher one is refused: "Access denied. You may not set a level above your own."
  (decision holo-port/0055).
- Staff give direct attributes to users strictly below their level (decision holo-port/0055).
- A holder of `housekeeping.access` signs in from a banned address: the address ban passes them (decision
  holo-port/0055).

## The guard

- A change leaves nobody holding both `housekeeping.access` and `housekeeping.accessGroups`: it is refused and
  explained, and the attribute or the membership stays (decision holo-port/0053).
- Another user holds both keys, from any group or directly: the change goes through (decision holo-port/0053).

## Staff fuses

- A hotel's groups hold the game's fuses of their level and the levels below, as Holo's ranks did: HabboX 6, Silver
  Hobba 10, Gold Hobba 16, Moderator 22 and Administrator all 31 (decision server/0046).
- A manager ticks a fuse on a group's page: the habbos of its members hold that right in the game.

## The staff log

- Staff change anything in housekeeping: one staff log row records who, the target user or habbo, the action, the
  detail, the address and the time.
- A holder of `housekeeping.logs` opens Staff Logs: the rows, newest first, 100 a page, with Newer and Older links.
- An account goes: its log rows stay (decision holo-port/0063).
- The staff log only grows: staff read it, and every row stays for good (decision holo-port/0063).
