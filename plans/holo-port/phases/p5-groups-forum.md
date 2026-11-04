---
type: Phase
title: P5 Groups and forum
description: Groups with group homes, membership management, the badge editor and renderer, and the site-wide discussion board.
status: planned
timestamp: 2026-11-04T20:03:37+00:00
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

- Group homes reuse the home editor, so they wait for the deferred [P3](/phases/p3-homes.md)
  ([0045](/decisions/0045-homes-deferred.md)).
- Group badge tints: two palettes, so that the user can pick one ([0042](/decisions/0042-two-badge-palettes.md)).
- Primitives: GroupBadge, Table. Settings: `groups.*`, `features.forum`, `features.smilies`.

- Forum posts of an archived habbo show it as `disabled` ([0058](/decisions/0058-habbos-are-archived.md)).

# Exit criteria

- Buying a group debits credits with a ledger row; join, request, accept, promote, leave and favourite work; the
  badge editor saves a code that the renderer draws.
- Threads and posts can be created, edited, previewed, moderated and reported.

# Tasks

Created when the phase starts.

# Open questions

Asked on 2026-11-04, after a reading of Holo's group and forum pages. The first option of each is the recommendation.

1. **Unlimited groups.** Holo's fourth type lets anyone join past the 500 limit, can never change back, and says
   "Unable to browse members" while still listing them. The schema has only open, moderated and closed.
   - Add it as Holo has it: one-way, with its texts and its member list.
   - Add it and show only its member count.
   - Leave it out.
2. **Group limits with several habbos.** Holo allows 3 owned groups and 10 memberships, requests included, to an
   account that had one habbo.
   - Owned groups per user, 3 in all, paid from the shared purse; memberships per habbo, 10 each.
   - Both per habbo.
   - Both per user.
3. **Members' stickers on a group home.** An admin who removes a member's sticker gets it, though the menu says "it
   will return to their inventory", and deleting the group destroys every item on its home.
   - Both go back to the member who placed them.
   - A removed sticker goes back to its member; deleting the group destroys everything, as its warning says.
   - Exactly as Holo's code.
4. **Name and description lengths.** 25 and 200, but the purchase never checks them, the settings counter starts at
   255, and a rename may take a used name, which the schema refuses.
   - 25 and 200 everywhere, the counter starting at 200, and a used name refused with "A group with this name already
     exists."
   - The counter stays at 255 with the refusal over 200, and a used name is refused.
5. **Staff tools for groups.** Holo's housekeeping only counts groups.
   - None in P5; the idea goes into `plans/later.md`.
   - A housekeeping page behind `housekeeping.groups` that edits or deletes a group.
6. **Several habbos: whose group roles and posts.** A user owns Ana and Nia and is signed in as Nia; Ana owns a group
   and wrote posts. [0065](/decisions/0065-owners-edit-all-their-homes.md) leaves group homes to P5.
   - Only the active habbo's: Nia sees the group as a visitor and cannot change Ana's posts.
   - Any of the user's habbos, as homes, with "Last modified ... by" naming the post's author.
7. **The online picture.** Holo meant online as a page view in the last 10 minutes, but its installer made the column
   a MEDIUMINT that cannot hold the time, so everyone showed offline. P4's pages show offline.
   - Offline everywhere until the game server.
   - Online for 10 minutes after a page view, on the forum and on P4's three pages.
8. **Sticky threads and pages.** Holo's arithmetic skips threads from page 3 on: with 2 stickies and 30 other
   threads, threads 17, 18, 27 and 28 are on no page, and 10 stickies hide every other thread.
   - Every sticky on every page, then 10 other threads.
   - Stickies only on page 1, above its 10 other threads.
9. **What `disabled` looks like** ([0058](/decisions/0058-habbos-are-archived.md)).
   - `disabled` in place of the name everywhere, unlinked, and a post box without avatar, badges, motto or count.
   - `disabled` in place of the name, unlinked; the rest of the box stays.
   - The name, unlinked, followed by `(disabled)`.
10. **How often someone can report.** Holo allows one request not yet picked up per address, help and reports
    together.
    - The same rule per habbo, as P7 plans for help.
    - Per address, as Holo.
    - Reports unlimited.
11. **Where the report asks.** Holo opens the Help Tool's small window and reports through a link.
    - The same window, built in P5, with Proceed as a button that posts; P7 reuses the frame.
    - A dialog on the thread page with Holo's texts.
12. **Blank posts and flooding.** Holo accepts blank posts and posts in quick succession.
    - Both stay allowed, as Holo.
    - Blank posts are refused, and so are posts within a few seconds of the habbo's last, with Holo's unused "Spam
      detected!".

These follow from accepted decisions and need no answer; each goes into the
[differences](/reference/holo-differences.md) with its task:

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
