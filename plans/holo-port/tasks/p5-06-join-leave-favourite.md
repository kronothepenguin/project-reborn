---
type: Task
title: Join, leave and favourite groups
description: The group page's buttons join a group or request membership, leave it, and make it the favourite or remove it, for the active habbo, with Holo's dialogs and answers and the limits.
status: todo
phase: p5
depends_on: [p5-05]
packages: [packages/cms, tests/e2e]
holo: [source/holo/joingroup.php, source/holo/leavegroup.php, source/holo/groups_select_favorite.php, source/holo/groups_deselect_favorite.php, source/holo/groups_confirm_leave.php, source/holo/groups_confirm_favorite.php, source/holo/groups_confirm_deselect_favorite.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Habbos join and leave groups and pick their favourite, as in Holo
([0081](/decisions/0081-groups-have-four-types.md), [0082](/decisions/0082-group-limits-per-user-and-habbo.md),
[0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).

# Steps

- [ ] The buttons, for the active habbo:
  - `Join` on Regular and Unlimited groups, `Request membership` on Exclusive ones, and none on Private ones or with a
    waiting request;
  - `Make favourite` or `Remove favourite` for members;
  - `Leave group` for members, never the owner.
- [ ] `POST /groups/{id}/join` answers as `joingroup.php`: joined, request made, full at `groups.maxMembers` for a
  Regular group, closed, already a member or a request, or `groups.maxMemberships` memberships and requests reached.
- [ ] `POST /groups/{id}/leave`, `/favourite` and `/unfavourite`, with Holo's confirmations; one favourite per
  habbo.
- [ ] Go tests, and the `groups` browser suite joins, requests, leaves and changes the favourite.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs groups
```
