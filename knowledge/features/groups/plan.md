---
type: Plan
title: "Groups: how"
description: The CMS sells, shows and runs groups and draws their badges, the store keeps them, and the game server shows the favourite badge in rooms.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/cms` | `/groups` routes, the purchase, group tools, member list and badge editor islands, group homes through the home editor, the badge renderer in `internal/badge`, the Me page's Groups box and the header's My Groups |
| `packages/store` | Groups, members, favourites and group homes |
| `packages/server` | The favourite group's badge in rooms, and 309 for `GET_GROUP_BADGES` |

The badge renderer and the vendored badge editor are in `packages/cms/knowledge/badge.md` and
`packages/cms/knowledge/habbo-widgets.md`.

# Decisions

- [Groups have Holo's four types, Unlimited included](/decisions/holo-port/0081-groups-have-four-types.md) — Regular,
  Exclusive, Private or Unlimited; an Unlimited group takes anyone and never changes type again.
- [Owned groups count per user, memberships per
  habbo](/decisions/holo-port/0082-group-limits-per-user-and-habbo.md) — A user owns at most three groups, paid from
  the shared purse, and each habbo holds at most ten memberships.
- [Items on a group home go back to the members who placed
  them](/decisions/holo-port/0083-group-home-items-return-to-members.md) — An item removed from a group home, and every
  item of a deleted group's home, goes back to its placer.
- [Group names take 25 characters and descriptions
  200](/decisions/holo-port/0084-group-names-and-descriptions.md) — A name another group has is refused.
- [Housekeeping gets no group tools yet](/decisions/holo-port/0085-no-housekeeping-group-tools-yet.md) — Holo's
  housekeeping only counted groups.
- [Group roles and forum posts belong to the active
  habbo](/decisions/holo-port/0086-roles-and-posts-follow-the-active-habbo.md) — The tools, joining, leaving and the
  favourite act for the active habbo only.
- [The group search and the report window get their own
  addresses](/decisions/holo-port/0095-group-search-and-report-addresses.md) — `GET /groups?name=` opens the group with
  exactly that name, ignoring case.
- [An archived habbo's stickers stay on group
  homes](/decisions/holo-port/0096-archived-habbos-stickers-stay-on-group-homes.md) — They stay until an admin removes
  them or the group is deleted.
- [Notes removed from a group home go back to their
  placers](/decisions/holo-port/0098-group-home-notes-go-back-to-their-placers.md) — A note goes back as a blank one.
- [Group badges get two palettes](/decisions/holo-port/0042-two-badge-palettes.md) and [the badge palettes are
  compared on one sheet](/decisions/holo-port/0093-badge-palettes-compared-on-a-sheet.md) — Both palettes were built
  and compared, which led to 0102.
- [Group badges keep the Tailwind palette](/decisions/holo-port/0102-badges-keep-the-tailwind-palette.md) — The 18
  tints are the closest Tailwind colours; tint 15, olive-500, is a known issue.
- [A habbo shows its favourite group's badge in
  rooms](/decisions/server/0068-a-habbo-shows-its-favourite-groups-badge.md) — 309 lists the badges of the groups
  shown.

# Notes

- The purchase dialog opens on what Holo's `grouppurchase.php` checked before its form, from the Me page's data, and the
  purchase checks it all again in its transaction.
- The Group information widget goes where Holo wrote it on a group's first view: 25, 25, layer 5, the default skin. A
  placed widget goes to 20, 20.
- Holo's member widget had no working pages and listed every member; so does this one.
- The member list sends one request per ticked habbo, then loads the list again, as Holo did after its `OK`.
- The settings reach their island through a hidden element's `data-` attributes, since a description may hold quotes.
- The header's My Groups shows Holo's titles `Favourite`, `Admin` and `Owner`; the Group Members widget shows Holo's
  `Favorite` and `Administrator`.
- Browsers keep a badge drawing for a year, so a browser that showed a badge before a palette change needs a hard
  reload.
