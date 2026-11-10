---
type: Task
title: Add the navigator's tables and Holo's data
description: The store gets the categories, the room models, the public rooms, the habbos' rooms and the favourite rooms, and an update seeds Holo's categories, public rooms and models; S3's settings join the Game form.
status: done
phase: s3
depends_on: []
packages: [packages/store, packages/virtual, packages/housekeeping]
client: []
timestamp: 2026-11-10T03:50:27+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:50:27+00:00"}
---

# Goal

The store holds what the navigator lists, and a new hotel starts with Holo's categories, public rooms and room models
([0055](/decisions/0055-holos-navigator-set.md)).

# Steps

- [x] A schema file of the navigator with `room_categories`, `room_models`, `public_rooms`, `rooms` and
  `favourite_rooms`: public rooms and habbo rooms apart, a habbo room with its creator and its owner, NOT NULL, and a
  favourite naming exactly one of the two ([0063](/decisions/0063-public-rooms-and-habbo-rooms-apart.md),
  `plans/holo-port/decisions/0057-furni-and-rooms.md`). A room's password is a hash
  ([0062](/decisions/0062-room-passwords-are-hashed.md)).
- [x] An update that creates them and seeds Holo's English categories, with their levels and trading flags, its 12 public
  rooms with their casts and most visitors, and its 42 models with their doors, heightmaps and public furni, read from
  the dumps in `source/holoemu` ([The Holograph Emulator](/reference/holoemu.md#the-dumps)).
- [x] The named queries S3's tasks need: the categories, the models and the public rooms; a habbo's rooms and their
  count; a category's rooms and a search, each with a limit; random rooms; one room; creating, changing and deleting a
  room; and a habbo's favourites, with adding, removing and counting them.
- [x] The settings `game.maxRoomsPerHabbo`, 50, `game.maxFavouriteRooms`, 30, `game.categoryMaxRooms`, 30, and
  `game.searchMaxRooms`, 30, in the catalogue and housekeeping's Game form
  ([0056](/decisions/0056-own-rooms-follow-holos-rules.md), [0058](/decisions/0058-favourites-saved-up-to-30.md),
  [0061](/decisions/0061-navigator-lists-show-up-to-30-rooms.md)).
- [x] Tests: the schema files and the updates describe one database; the seeded counts, 15 categories, 12 public rooms
  and 42 models; a favourite with both rooms or neither is refused; the settings' defaults and the form.
- [x] OKF concepts of the tables, the queries, the update and the entities, with the `adding-data-persistence` skill.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/virtual && go test ./... -race
cd packages/housekeeping && go test ./... -race
make gates
```

Results:

- `packages/store/schema/navigator.schema.sql` declares `room_categories`, `room_models`, `public_rooms`, `rooms` and
  `favourite_rooms` ([0063](/decisions/0063-public-rooms-and-habbo-rooms-apart.md)). Every foreign key names an id, as
  the store's do, so a room has `room_model_id` and `room_category_id`; a habbo room has its creator and owner habbos
  and a `password_hash` ([0062](/decisions/0062-room-passwords-are-hashed.md)); a favourite names exactly one room, once.
- The update `0010-navigator.sql`, not automatic, creates them and seeds Holo's data with fixed ids
  ([0055](/decisions/0055-holos-navigator-set.md)): the 15 English categories, where Holo's rank 1 is level 0 and "No
  category" takes the id 2 for Holo's 0, which ends the client's list of nodes; the 42 models, a line per heightmap row
  and per public furni item, without Holo's carriage returns and the stray character 1 of `sunset_cafe`, with the club
  models of the client's `private.room.properties`, `g`, `h` and `o` to `r`, since Holo's dump marks none; and the 12
  public rooms, 101 to 112.
- `navigator.query.sql` holds 22 named operations for S3's tasks. `SearchRooms` takes a pattern that escapes `%`, `_`
  and `!` with `!`, and puts its `LIKE` last: `sqlc` leaves the arguments after an `ESCAPE` clause unbound.
- The settings `game.maxRoomsPerHabbo` 50, `game.maxFavouriteRooms` 30, `game.categoryMaxRooms` 30 and
  `game.searchMaxRooms` 30, each between 1 and 1000, are in the catalogue and housekeeping's Game form.
- In `packages/store`, `go vet ./...` and `go test ./...` pass, with `TestANewDatabaseHasHolosNavigator`,
  `TestOnlyARoomsOwnerChangesOrDeletesIt`, `TestAFavouriteNamesOneRoomOnce`, `TestSearchRoomsMatchesTheNameOrTheOwner`
  and `TestTheUpdatesBuildTheDatabaseTheSchemaFilesDescribe`; `make check-docs` exits 0; regenerating leaves the
  generated files unchanged. `packages/virtual`'s `TestTheGameSettingsHoldTheirDefaults` and housekeeping's
  `TestTheGameFormHoldsTheClientsSettings` pass with the four settings.
- The OKF concepts of the schema, the queries, the update, the five tables and five entities are added, and the habbo
  entity links its rooms.

# Notes

- Runs on the branch `s3-navigator-tables`.
