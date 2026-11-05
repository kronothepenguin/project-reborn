---
type: Task
title: Manage a group's members
description: The Members dialog lists a group's members and waiting requests twelve a page, and lets its admins accept or decline requests and give, revoke or remove rights and members, never touching the owner, with Holo's confirmations.
status: done
phase: p5
depends_on: [p5-07]
packages: [packages/cms, tests/e2e]
holo: [source/holo/groups_memberlist.php, source/holo/groups_accept.php, source/holo/groups_decline.php, source/holo/groups_give_rights.php, source/holo/groups_revoke_rights.php, source/holo/groups_remove.php, source/holo/groups_confirm_accept.php, source/holo/groups_confirm_decline.php, source/holo/groups_confirm_give_rights.php, source/holo/groups_confirm_revoke_rights.php, source/holo/groups_confirm_remove.php]
timestamp: 2026-11-05T20:49:05+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:49:05+00:00"}
---

# Goal

Admins manage members as in Holo's member list, with the checks Holo lacked
([0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).

# Steps

- [x] `GET /groups/{id}/members` for the group's admins: Holo's two tabs with their counts, 12 a page,
  `First | << | >> | Last`, the owner and admin icons, and the checkboxes Holo disabled.
- [x] ⚡`groups/member-list`: the dialog with `Give rights`, `Revoke rights`, `Remove`, `Accept`, `Reject`
  and `Close`, and Holo's confirmations.
- [x] `POST /groups/{id}/members/{member}/{accept,decline,promote,demote,remove}` checks the admin on every request,
  never touches the owner, and accepts or declines only requests.
- [x] Go tests, and the `groups` browser suite runs each action.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs groups
```

Results (2026-11-05T20:49:05+00:00):

- `gofmt`, `go vet` and `go test` pass in the whole of `packages/cms`; `pnpm build` passes, and `svelte-check` finds
  nothing in the new component.
- `node run.mjs groups` passes all 54 checks. The nine new ones sign Admin-1 in and find:
  - Members listing the owner, who cannot be ticked, and Frank, with `Members (2)`, `Pending Members (0)`, `1 - 2 /
    2` and `First | << | >> | Last`;
  - every action off with nobody ticked; Give rights and Remove on for a member; Revoke rights and Remove for an
    admin; only Remove for an admin and a member together, as Holo's script decided;
  - Give rights asking first and making Frank an admin, with the list coming back with his icon;
  - Accept asking first, turning Frank's request into a membership, the list then saying Holo's line for no
    requests and the titles counting it.
  The screenshot `group-members` was read by eye.
- The CMS tests list members twelve a page, the owner and admins first, with both counts, the first page for one out
  of range, and the requests; refuse a member, a habbo asking, the owner's other habbo and a guest; let an admin who
  is not the owner act; and touch, per action, only what Holo meant, refusing the owner and unknown actions.
- Breaking these on purpose fails a test: any member taken for an admin, pages out of range kept, ten a page, every
  admin shown as owner, Revoke rights promoting, the requests never listed, Give rights on for a mixed choice,
  Revoke rights on for one, and Remove always off.

# Notes

- `groups/member-list` opens from the Edit menu, which now shows to the group's admins with Members, and to the owner
  with Settings too ([0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).
- Holo sent every ticked habbo in one request; the dialog sends one request per habbo to the plan's route, then
  loads the list again, as Holo did after its `OK`.
- Holo's member search was hidden and never worked, and its click on a row asked for
  `groups_memberlist_avatarinfo.php`, which Holo never had; neither is ported.
- The list keeps Holo's empty text, `There are no pending membership requests at this time. Please check back later.`,
  for both tabs, as Holo wrote it.
- A first check of the mixed choice passed with a broken rule: the suite had no group with an admin and a member to
  tick together. Quiet Corner, with Dora and Eve, gives it one.

