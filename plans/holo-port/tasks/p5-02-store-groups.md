---
type: Task
title: Store groups and their members
description: The store gains the group operations the pages need, from buying and joining to roles, member lists, settings and deletion, with archived habbos left out, and documents the group entity.
status: done
phase: p5
depends_on: []
packages: [packages/store]
holo: [source/holocms/install.php]
timestamp: 2026-11-05T19:26:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:26:37+00:00"}
---

# Goal

The CMS reads and changes groups through tested queries
([0081](/decisions/0081-groups-have-four-types.md) to [0084](/decisions/0084-group-names-and-descriptions.md),
[0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).

# Steps

- [x] Reading:
  - a group by id or by name, with its members counted;
  - the groups a user's habbos own;
  - a habbo's memberships, requests included;
  - a habbo's groups with role and favourite, and its favourite group;
  - random groups;
  - members and requests a page at a time, admins first, and their counts.
- [x] Changing:
  - a group with its owner's admin row, and its home with the Group information widget;
  - joining, requesting, leaving, the favourite;
  - accepting and declining requests only, and promoting, demoting and removing members;
  - the name, description, type and badge, and removing the waiting requests;
  - deleting a group, whose home's stickers and notes go back to the users whose habbos placed them, notes blank, as
    archiving does ([0083](/decisions/0083-group-home-items-return-to-members.md)).
- [x] Archived habbos are left out of every list and count of members
  ([0089](/decisions/0089-archived-habbos-show-as-archived.md)).
- [x] The `access` values `open`, `moderated`, `closed` and `unlimited` are Holo's Regular, Exclusive, Private
  and Unlimited, in the group entity's docs with the roles, the favourite and the limits.
- [x] Store tests for the order and pages of members, the counts, the requests that accept and decline touch, and the
  items of a deleted group's home.

# Verification

```sh
cd packages/store && go tool sqlc diff && gofmt -l . && go vet ./... && go test -race ./... && make check-docs
```

Results (2026-11-05T19:26:37+00:00):

- `go tool sqlc diff`, `gofmt`, `go vet`, `go test -race` and `make check-docs` pass in `packages/store`.
- The store tests:
  - a name ignores case and a second one conflicts;
  - owned groups count across the user's habbos, and memberships count the habbo's requests too;
  - members and requests leave out archived habbos, in the lists and the counts;
  - members come admins first, the owner leading, then in the order they asked, a page at a time, and requests in
    the order they were made;
  - accept and decline touch only requests, and the owner is never demoted, removed or let go;
  - a habbo has one favourite, only among the groups it joined;
  - a habbo's groups are the ones it joined, with role, favourite and owner;
  - leaving Exclusive removes only the requests;
  - deleting a group returns its stickers and notes to the users whose habbos placed them, adding to what they hold,
    and takes its memberships, home and items with it.
- Breaking these on purpose fails a test: archived habbos counted as members or requests, accept or decline on any
  row, the owner's guard, admins not first, requests by id, favourites for requests, requests among a habbo's
  groups, a type change removing members, notes not returned, a returned item replacing what the user held, and the
  owned groups of one habbo only.

# Notes

- The schema needs no update: `access` is TEXT without a CHECK (0081).
- `ReturnHomeItemsToPlacers` runs before `DeleteGroup` in one transaction; the CMS composes both in
  [p5-07](/tasks/p5-07-group-settings.md), as it composes the purchase in [p5-04](/tasks/p5-04-buy-groups.md).
- sqlc expands `groups.*` into a query its own grammar refuses, so `GetFavouriteGroup` names its columns; and a
  column beside the owner's subquery is qualified with its table.
