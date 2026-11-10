---
type: Task
title: Add the navigator's tables and Holo's data
description: The store gets the categories, the room models, the public rooms, the habbos' rooms and the favourite rooms, and an update seeds Holo's categories, public rooms and models; S3's settings join the Game form.
status: todo
phase: s3
depends_on: []
packages: [packages/store, packages/virtual, packages/housekeeping]
client: []
timestamp: 2026-11-10T03:40:35+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
---

# Goal

The store holds what the navigator lists, and a new hotel starts with Holo's categories, public rooms and room models
([0055](/decisions/0055-holos-navigator-set.md)).

# Steps

- [ ] A schema file of the navigator with `room_categories`, `room_models`, `public_rooms`, `rooms` and
  `favourite_rooms`: public rooms and habbo rooms apart, a habbo room with its creator and its owner, NOT NULL, and a
  favourite naming exactly one of the two ([0063](/decisions/0063-public-rooms-and-habbo-rooms-apart.md),
  `plans/holo-port/decisions/0057-furni-and-rooms.md`). A room's password is a hash
  ([0062](/decisions/0062-room-passwords-are-hashed.md)).
- [ ] An update that creates them and seeds Holo's English categories, with their levels and trading flags, its 12 public
  rooms with their casts and most visitors, and its 42 models with their doors, heightmaps and public furni, read from
  the dumps in `source/holoemu` ([The Holograph Emulator](/reference/holoemu.md#the-dumps)).
- [ ] The named queries S3's tasks need: the categories, the models and the public rooms; a habbo's rooms and their
  count; a category's rooms and a search, each with a limit; random rooms; one room; creating, changing and deleting a
  room; and a habbo's favourites, with adding, removing and counting them.
- [ ] The settings `game.maxRoomsPerHabbo`, 50, `game.maxFavouriteRooms`, 30, `game.categoryMaxRooms`, 30, and
  `game.searchMaxRooms`, 30, in the catalogue and housekeeping's Game form
  ([0056](/decisions/0056-own-rooms-follow-holos-rules.md), [0058](/decisions/0058-favourites-saved-up-to-30.md),
  [0061](/decisions/0061-navigator-lists-show-up-to-30-rooms.md)).
- [ ] Tests: the schema files and the updates describe one database; the seeded counts, 15 categories, 12 public rooms
  and 42 models; a favourite with both rooms or neither is refused; the settings' defaults and the form.
- [ ] OKF concepts of the tables, the queries, the update and the entities, with the `adding-data-persistence` skill.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/virtual && go test ./... -race
cd packages/housekeeping && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s3-navigator-tables`.
