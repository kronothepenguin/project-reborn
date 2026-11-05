---
type: Task
title: Store groups and their members
description: The store gains the group operations the pages need, from buying and joining to roles, member lists, settings and deletion, with archived habbos left out, and documents the group entity.
status: todo
phase: p5
depends_on: []
packages: [packages/store]
holo: [source/holo/install.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

The CMS reads and changes groups through tested queries
([0081](/decisions/0081-groups-have-four-types.md) to [0084](/decisions/0084-group-names-and-descriptions.md),
[0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).

# Steps

- [ ] Reading:
  - a group by id or by name, with its members counted;
  - the groups a user's habbos own;
  - a habbo's memberships, requests included;
  - a habbo's groups with role and favourite, and its favourite group;
  - random groups;
  - members and requests a page at a time, admins first, and their counts.
- [ ] Changing:
  - a group with its owner's admin row, and its home with the Group information widget;
  - joining, requesting, leaving, the favourite;
  - accepting and declining requests only, and promoting, demoting and removing members;
  - the name, description, type and badge, and removing the waiting requests;
  - deleting a group, whose home's stickers and notes go back to the users whose habbos placed them, notes blank, as
    archiving does ([0083](/decisions/0083-group-home-items-return-to-members.md)).
- [ ] Archived habbos are left out of every list and count of members
  ([0089](/decisions/0089-archived-habbos-show-as-archived.md)).
- [ ] The `access` values `open`, `moderated`, `closed` and `unlimited` are Holo's Regular, Exclusive, Private
  and Unlimited, in the group entity's docs with the roles, the favourite and the limits.
- [ ] Store tests for the order and pages of members, the counts, the requests that accept and decline touch, and the
  items of a deleted group's home.

# Verification

```sh
cd packages/store && go tool sqlc diff && gofmt -l . && go vet ./... && go test -race ./... && make check-docs
```

# Notes

- The schema needs no update: `access` is TEXT without a CHECK (0081).
