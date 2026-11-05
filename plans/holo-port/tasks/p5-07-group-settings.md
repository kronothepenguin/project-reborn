---
type: Task
title: Change and delete a group
description: A group's admins get Holo's Edit menu, and its owner's Settings change the name, description and type with Holo's confirmations or delete the group, whose home's items go back to the members who placed them.
status: todo
phase: p5
depends_on: [p5-06]
packages: [packages/cms, tests/e2e]
holo: [source/holo/group_profile.php, source/holo/group_settings.php, source/holo/update_group_settings.php, source/holo/groups_delete_group.php, source/holo/groups_confirm_delete_group.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Owners run their groups as on Holo's group page ([0081](/decisions/0081-groups-have-four-types.md),
[0083](/decisions/0083-group-home-items-return-to-members.md), [0084](/decisions/0084-group-names-and-descriptions.md),
[0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).

# Steps

- [ ] The `Edit` button and its menu while the habbo holding the role is active: `Modify page`, `Settings` for
  the owner, `Badge` and `Members`.
- [ ] ⚡`groups/group-settings`: Holo's dialog with the name, the text and its counter from 200, the four types with
  their texts, Unlimited locked once chosen, Holo's confirmations, `Save changes`, `Delete group` and `Cancel`.
- [ ] `POST /groups/{id}/settings` for the owner answers as `update_group_settings.php`, refuses a taken name, and
  removes the waiting requests when the type leaves Exclusive.
- [ ] `POST /groups/{id}/delete`, after Holo's warning, deletes the group, its memberships and its home, and returns
  the home's stickers and notes to the users whose habbos placed them.
- [ ] Go tests, and the `groups` browser suite changes and deletes a group.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs groups
```
