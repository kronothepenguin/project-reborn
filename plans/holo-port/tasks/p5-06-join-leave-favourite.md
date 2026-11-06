---
type: Task
title: Join, leave and favourite groups
description: The group page's buttons join a group or request membership, leave it, and make it the favourite or remove it, for the active habbo, with Holo's dialogs and answers and the limits.
status: done
phase: p5
depends_on: [p5-05]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/joingroup.php, source/holocms/leavegroup.php, source/holocms/groups_select_favorite.php, source/holocms/groups_deselect_favorite.php, source/holocms/groups_confirm_leave.php, source/holocms/groups_confirm_favorite.php, source/holocms/groups_confirm_deselect_favorite.php]
timestamp: 2026-11-05T20:26:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:26:12+00:00"}
---

# Goal

Habbos join and leave groups and pick their favourite, as in Holo
([0081](/decisions/0081-groups-have-four-types.md), [0082](/decisions/0082-group-limits-per-user-and-habbo.md),
[0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).

# Steps

- [x] The buttons, for the active habbo:
  - `Join` on Regular and Unlimited groups, `Request membership` on Exclusive ones, and none on Private ones or with a
    waiting request;
  - `Make favourite` or `Remove favourite` for members;
  - `Leave group` for members, never the owner.
- [x] `POST /groups/{id}/join` answers as `joingroup.php`: joined, request made, full at `groups.maxMembers` for a
  Regular group, closed, already a member or a request, or `groups.maxMemberships` memberships and requests reached.
- [x] `POST /groups/{id}/leave`, `/favourite` and `/unfavourite`, with Holo's confirmations; one favourite per
  habbo.
- [x] Go tests, and the `groups` browser suite joins, requests, leaves and changes the favourite.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs groups
```

Results (2026-11-05T20:26:12+00:00):

- `gofmt`, `go vet` and `go test` pass in the whole of `packages/cms`; `pnpm build` passes, and `svelte-check` finds
  nothing in the new island.
- `node run.mjs groups` passes all 34 checks. The ten new ones sign Frank in and find:
  - Remove favourite and Leave group on his favourite group;
  - Join answering `You have now joined this group.` in Holo's dialog, whose OK reloads the page with Make
    favourite and Leave group;
  - Make favourite asking first and moving the favourite;
  - Leave group asking first, Cancel keeping the membership, and OK taking it with the favourite and offering Join
    again;
  - Request membership on an Exclusive group making a request and then offering nothing, and a Private group
    offering nothing.
  The screenshot `group-joined` was read by eye.
- The CMS tests answer each of `joingroup.php`'s cases in its order: joined, requested, closed, already, full at
  `groups.maxMembers` without counting archived habbos, no limit for Unlimited, and the limit of
  `groups.maxMemberships` before anything, counting requests. They leave, withdraw a request, refuse the owner and a
  second leave, keep the favourite to members and to the active habbo, refuse guests and missing groups, and offer
  each viewer Holo's tools.
- Breaking these on purpose fails a test: `>` for a full group or for the limit, a refused favourite that still
  clears the old one, the tools offered to a waiting request, Leave offered to the owner, a request that joins at
  once, and an unfavourite allowed to a waiting request.

# Notes

- The tools are an island, `groups/group-actions`, in the group page's header: Holo's links with the icons of
  `myhabbo_icons.png`, now under `web-gallery/v2/images`.
- The dialogs are Holo's untitled ones. Join answers with its message and an OK that reloads the page; Leave group
  and the favourites ask first and reload at once, Leave group after `You have successfully left this group.` and
  `Please wait, you are being redirected..`.
- Every action is the active habbo's ([0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).
- The handlers of the group's own routes now live in `groups.go`, as the mux patterns name them; `groups-view.go`
  of [p5-05](/tasks/p5-05-group-page.md) joined it.

