---
type: Task
title: Manage a group's members
description: The Members dialog lists a group's members and waiting requests twelve a page, and lets its admins accept or decline requests and give, revoke or remove rights and members, never touching the owner, with Holo's confirmations.
status: todo
phase: p5
depends_on: [p5-07]
packages: [packages/cms, tests/e2e]
holo: [source/holo/groups_memberlist.php, source/holo/groups_accept.php, source/holo/groups_decline.php, source/holo/groups_give_rights.php, source/holo/groups_revoke_rights.php, source/holo/groups_remove.php, source/holo/groups_confirm_accept.php, source/holo/groups_confirm_decline.php, source/holo/groups_confirm_give_rights.php, source/holo/groups_confirm_revoke_rights.php, source/holo/groups_confirm_remove.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Admins manage members as in Holo's member list, with the checks Holo lacked
([0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).

# Steps

- [ ] `GET /groups/{id}/members` for the group's admins: Holo's two tabs with their counts, 12 a page,
  `First | << | >> | Last`, the owner and admin icons, and the checkboxes Holo disabled.
- [ ] ⚡`groups/member-list`: the dialog with `Give rights`, `Revoke rights`, `Remove`, `Accept`, `Reject`
  and `Close`, and Holo's confirmations.
- [ ] `POST /groups/{id}/members/{member}/{accept,decline,promote,demote,remove}` checks the admin on every request,
  never touches the owner, and accepts or declines only requests.
- [ ] Go tests, and the `groups` browser suite runs each action.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs groups
```
