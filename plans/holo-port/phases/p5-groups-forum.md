---
type: Phase
title: P5 Groups and forum
description: Groups with group homes, membership management, the badge editor and renderer, and the site-wide discussion board.
status: planned
timestamp: 2026-10-27T20:48:19+00:00
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

- Primitives: GroupBadge, Table. Settings: `groups.*`, `features.forum`, `features.smilies`.

# Exit criteria

- Buying a group debits credits with a ledger row; join, request, accept, promote, leave and favourite work; the
  badge editor saves a code that the renderer draws.
- Threads and posts can be created, edited, previewed, moderated and reported.

# Tasks

Created when the phase starts.

# Open questions

- **Badge tints:** group badge images use the 18 tints shared with the HabboWidgets badge editor. They are pixel
  data, not CSS, so the plan keeps them as in Holo — the only exception to the Tailwind colour rule. Waiting for the
  user's confirmation.
