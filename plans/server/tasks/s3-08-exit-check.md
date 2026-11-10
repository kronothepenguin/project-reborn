---
type: Task
title: Check S3's exit criteria
description: From the merged work, check every exit criterion of S3 and close the phase.
status: done
phase: s3
depends_on: [s3-01, s3-02, s3-03, s3-04, s3-05, s3-06, s3-07]
packages: [packages/server, packages/store, packages/virtual]
client: []
timestamp: 2026-11-10T13:11:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:40:35+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T13:11:45+00:00"}
---

# Goal

S3 meets its [exit criteria](/phases/s3-navigator.md#exit-criteria) on `main`.

# Steps

- [x] Every exit criterion of [S3](/phases/s3-navigator.md), checked one by one on the merged work.
- [x] `packages/server/README.md` and the reference describe what S3 added.
- [x] S3 is `done`; `/index.md` names the next phase.

# Verification

```sh
make install && make gates
cd packages/server && go test ./... -race -v
```

Results, on the merged work of s3-01 to s3-07 (`main` at `21dbb62f`):

- "The navigator's categories, public rooms and room models come from an update with Holo's data, and load when the
  server starts": store's `TestANewDatabaseHasHolosNavigator` and `TestTheUpdatesBuildTheDatabaseTheSchemaFilesDescribe`,
  and the server's `TestTheServerStartsWithTheNavigator` and `TestTheNavigatorWaitsForTheUpdates`. Passes.
- "A Go test client browses the navigator…": `TestAClientBrowsesTheNavigator`, added here, browses in one session the
  public categories with the Welcome Lounge, a category of 31 habbo rooms that lists 30, its parents, the seven
  categories a level 0 habbo may use, its own 31 rooms, a search that finds 30, three recommended rooms, and its
  favourites: 30 kept, the 31st answered with 33, one removed. With `TestNavigatingThePublicRooms`,
  `TestTheCategoriesAHabboMayUse`, `TestKeepingFavouriteRooms`, `TestTheFavouritesHaveALimit` and
  `TestSearchingRooms`. Passes.
- "A habbo creates a room with the room-o-matic, up to 50…": `TestAHabboBuildsChangesAndDeletesARoom`, added here,
  refuses a club model without the club fuse, creates the 50th room and refuses the 51st, keeps the room out of Staff's
  Rooms and puts it in Chil Rooms, sets its description, its password, stored as a hash, its furniture rights and its
  visitors, changes its name, door and category, and deletes it. With `TestAClubModelNeedsTheClubFuse`,
  `TestTheRoomLimit` and `TestDeletingARoom`. Passes.
- "S3's settings are in housekeeping": housekeeping's `TestTheGameFormHoldsTheClientsSettings` and `packages/virtual`'s
  `TestTheGameSettingsHoldTheirDefaults`. Passes.
- "Every gate passes": `make install` exits 0 and changes no tracked file; `make gates` exits 0, with 31 packages `ok`;
  `go test ./... -race -v` in `packages/server` passes its 102 tests.
- `packages/server/README.md` lists S3's tests beside the navigator's and the room-o-matic's commands, and
  [the architecture](/reference/architecture.md) describes what S3 added.
- [S3](/phases/s3-navigator.md) is done. [S4](/phases/s4-rooms.md) is next, once its open questions are answered.

# Notes

- Runs on the branch `s3-exit-check`.
