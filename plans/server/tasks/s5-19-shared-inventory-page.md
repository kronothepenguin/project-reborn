---
type: Task
title: Show the shared inventory on the site
description: The CMS lists the furni of a user that no habbo holds, with a Take button that moves it to the active habbo's hand, and archiving a habbo sends its hand there.
status: done
phase: s5
depends_on: [s5-04]
packages: [packages/store, packages/cms]
client: []
timestamp: 2026-11-12T15:53:48+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-12T15:53:48+00:00"}
---

# Goal

A user reaches the furni that none of its habbos holds ([0095](/decisions/0095-s5-builds-four-site-pieces.md),
`plans/holo-port/decisions/0057-furni-and-rooms.md`).

# Steps

- [x] The page lists the user's shared furni, and Take moves a furni to the active habbo's hand.
- [x] Archiving a habbo moves its hand to the shared inventory, in the same transaction
  (`plans/holo-port/decisions/0057-furni-and-rooms.md`).
- [x] Tests.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/cms && go test ./... -race
make gates
```

Results:

- The site has the account page Furni, `/account/furni`, after Habbos in the menu
  ([0122](/decisions/0122-the-shared-inventory-is-an-account-page.md)): the furni of the user that no habbo holds, no
  room has, no present holds and no recycler keeps, a row for each kind with how many there are. `POST
  /account/furni/take` moves a kind, or everything, to the active habbo's hand
  ([0123](/decisions/0123-take-moves-a-kind-of-furni-or-all.md)).
- `auth.ArchiveHabbo` now also shares the furni of the habbo's hand and of its recycler, ends its recycling and gives
  its rooms to the session's habbo, in the transaction that archives it
  ([0124](/decisions/0124-an-archived-habbos-rooms-move-to-the-active-habbo.md)).
- The store's queries: `ListSharedFurni`, `TakeSharedFurni`, `TakeAllSharedFurni`, `ShareAvatarFurni` and
  `MoveRoomsToAvatar`.
- `plans/later.md` gained "The game server and a habbo archived on the site".
- In `packages/store`, `go vet ./...`, `go test ./...` and `make check-docs` pass; `go test ./... -race` passes in
  `packages/auth`; in `packages/cms` the habbo and furni tests pass with `-race`,
  `TestArchivingSharesFurniAndTheFurniPageTakesIt` among them. `make gates` passes.

# Notes

- Runs on the branch `s5-shared-inventory-page`.
- Settled before it started: the page is `/account/furni`, after Habbos in the account's menu
  ([0122](/decisions/0122-the-shared-inventory-is-an-account-page.md)); Take moves a kind, or all
  ([0123](/decisions/0123-take-moves-a-kind-of-furni-or-all.md)); and an archived habbo's rooms move to the active
  habbo, its recycler's furni to the shared inventory
  ([0124](/decisions/0124-an-archived-habbos-rooms-move-to-the-active-habbo.md)).
- Chosen without asking: a kind is a furni definition, whatever each piece's state, and goes by the name the catalogue
  sells it under, or by its sprite; the page's texts, `Furni that none of your habbos holds waits here…`, `No furni
  waits here.`, `<n> furni moved to <habbo>'s hand.` and `There is no such furni to take.`; a furni that waits in a
  present is not shared, and comes with its box.
- Left for later: the game server learns of none of this while it runs. A room that is loaded keeps the owner it loaded
  with until it unloads, and an archived habbo that is in the hotel stays there until it leaves; `plans/later.md` has
  it.
