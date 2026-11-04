---
type: Phase
title: P5 Groups and forum
description: Groups with group homes, membership management, the badge editor and renderer, and the site-wide discussion board.
status: planned
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [p5, cms]
---

# Goal

Habbos buy, join and run groups with decorated group homes and badges, and talk in the discussion board.

# Scope

| Holo source | Routes | Astro pages | Composed UI (⚡ = island) |
| --- | --- | --- | --- |
| `group_profile.php` | `GET /groups/{id}`, `GET /groups/{id}/edit` | `groups/id.astro`, `groups/id/edit.astro` | ⚡`groups/group-tools`, `homes/home-editor` reused through `home_id`, group-info and member widgets |
| `grouppurchase.php`, `joingroup.php`, `leavegroup.php`, `groups_(de)select_favorite.php` | `POST /groups`, `POST /groups/{id}/join`, `/leave`, `/favourite`, `/unfavourite` | — | ⚡`groups/group-purchase` (`features.groupPurchase`, `groups.*`) |
| `group_settings.php`, `update_group_settings.php`, `groups_delete_group.php` | `POST /groups/{id}/settings`, `POST /groups/{id}/delete` | — | ⚡`groups/group-settings` (owner only) |
| `groups_memberlist.php`, `groups_{accept,decline,give_rights,revoke_rights,remove}.php` | `GET /groups/{id}/members`, `POST /groups/{id}/members/{member}/{accept,decline,promote,demote,remove}` | — | ⚡`groups/member-list`; admin check on every action (Holo's accept had none) |
| `show_badge_editor.php`, `save_group_badge.php`, `habbo-imaging/badge.php` | `POST /groups/{id}/badge`, `GET /habbo-imaging/badge/{code}` | — | ⚡`groups/badge-editor` (`vendor/HabboWidgets/badge-editor`); renderer in `packages/cms/internal/badge` ([format](/reference/holo-protocols.md#group-badges)) with a strict code validator and immutable cache headers |
| `randomgroups.php`, `quickmenu.php?key=groups`, `groupinfo.php` | `GET /groups/random`, `GET /me/groups`, `GET /groups/{id}/info` | — | ⚡`me/groups-habblet`, header quick menu (groups only), profile groups widget |
| `forum.php`, `viewthread.php` | `GET /forum`, `GET /forum/threads/{id}` | `forum.astro`, `forum/threads/id.astro` | `forum/topic-list`, `forum/post`; `features.forum` |
| `newtopic.php`, `savetopic.php`, `savepost.php`, `updatepost.php`, `deletepost.php`, `previewpost.php` | `POST /forum/threads`, `POST /forum/threads/{id}/posts`, `POST /forum/posts/{id}`, `POST /forum/posts/{id}/delete`, `POST /bbcode/preview` | — | ⚡`forum/new-thread`, ⚡`forum/reply-form`; the author or `forum.edit` may edit |
| `opentopicsettings.php`, `savetopicsettings.php`, `deletetopic.php`, `iot/go.php?do=report` | `POST /forum/threads/{id}/settings`, `POST /forum/threads/{id}/delete`, `POST /forum/posts/{id}/report` | — | ⚡`forum/moderation` (`forum.edit`); a report creates a `help_tickets` row with `forum_post_id` |

- Group homes reuse the home editor of [P3](/phases/p3-homes.md).
- Group badge tints: two palettes, so that the user can pick one ([0042](/decisions/0042-two-badge-palettes.md)).
- Primitives: GroupBadge, Table. Settings: `groups.*`, `features.forum`, `features.smilies`.

- Forum posts of an archived habbo show `archived` in place of its name
  ([0089](/decisions/0089-archived-habbos-show-as-archived.md)).

Decided with the user before the start:

- Groups have Holo's four types, Unlimited included ([0081](/decisions/0081-groups-have-four-types.md)).
- A user owns 3 groups in all, and each habbo holds 10 memberships
  ([0082](/decisions/0082-group-limits-per-user-and-habbo.md)).
- Items on a group home go back to the members who placed them
  ([0083](/decisions/0083-group-home-items-return-to-members.md)).
- Names take 25 characters and descriptions 200 ([0084](/decisions/0084-group-names-and-descriptions.md)).
- Housekeeping gets no group tools yet ([0085](/decisions/0085-no-housekeeping-group-tools-yet.md)).
- Group roles and forum posts belong to the active habbo
  ([0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).
- The online picture stays offline ([0087](/decisions/0087-online-picture-stays-offline.md)).
- Sticky threads head every page ([0088](/decisions/0088-stickies-head-every-page.md)).
- A habbo has one waiting request, and reports open the Help Tool's window ([0090](/decisions/0090-post-reports.md)).
- Blank posts, and posts within 30 seconds of the habbo's last, are refused
  ([0091](/decisions/0091-forum-spam-check.md)).
- Posts are written in the BBCode editor of [ED](/phases/ed-bbcode-editor.md)
  ([0092](/decisions/0092-bbcode-editor.md)).

These follow from accepted decisions, and each goes into the [differences](/reference/holo-differences.md) with its
task:

- One board for the whole site, as Holo and the schema have.
- Holo's unsafe or missing checks are fixed:
  - guests cannot post or report, and nothing changes on a GET;
  - the admin check runs on every request;
  - nobody demotes, removes or locks out a group's owner, and the owner cannot leave;
  - accept and decline touch only requests;
  - badge codes are checked strictly, and the CMS draws them with cache headers;
  - texts are escaped, and a group's price and its ledger row are written together.
- Titles over 30 characters, posts over 65,535 characters and blank renames are refused, and a reply to a thread
  closed meanwhile shows it closed instead of vanishing.
- A deleted post returns to its thread, unless the thread went with it.
- Changing an Exclusive group's type removes its waiting requests at once.
- Message counts and the order of threads come from the posts that exist, as the plan says.
- Holo's typos are spelled correctly, as on the other CMS pages.
- Both badge palettes are built for the user to choose ([0042](/decisions/0042-two-badge-palettes.md)), and the
  editor and the renderer share one.

# Exit criteria

- Buying a group debits credits with a ledger row; join, request, accept, promote, leave and favourite work; the
  badge editor saves a code that the renderer draws.
- Threads and posts can be created, edited, previewed, moderated and reported.

# Tasks

Created when the phase starts, after [ED](/phases/ed-bbcode-editor.md).

