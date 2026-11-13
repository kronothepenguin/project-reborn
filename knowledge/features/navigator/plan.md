---
type: Plan
title: "Navigator: how"
description: The game server answers the navigator from the shared categories, models and public rooms in virtual and the habbo rooms in the store.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/server` | `navigator.go` and `kiosk_room.go` answer the navigator and the room-o-matic; `game` holds rules |
| `packages/virtual` | `category`, `model` and `room` hold the categories, models and public rooms, loaded at start |
| `packages/store` | The categories, models, public rooms, habbo rooms and favourites, and Holo's data as an update |
| `packages/housekeeping` | The Game form edits the navigator's limits |

Planned:

Written when the feature starts, with what [presence and rooms](/features/presence-and-rooms/spec.md) holds.

# Decisions

- [Slices follow the hotel's own features, and habbos comes
  first](/decisions/reborn/0010-slices-follow-the-hotels-features.md) — The economy and club are separate slices, furni
  with its catalogue is furnis, friends is the messenger, and habbos, rooms and navigator are slices of their own; the
  habbos slice is the first feature built, end to end from the site to the client.
- [A hotel starts with Holo's categories, public rooms and room models](/decisions/server/0055-holos-navigator-set.md) —
  An update seeds Holo's English categories, 12 public rooms and 42 room models.
- [A habbo's own rooms follow Holo's rules](/decisions/server/0056-own-rooms-follow-holos-rules.md) — Up to 50 rooms,
  names of 1 to 50 characters, three doors, passwords of 1 to 32 characters, and 10 to 25 visitors.
- [The recommended rooms are three random habbo
  rooms](/decisions/server/0057-three-random-recommended-rooms.md) — Drawn again each time the client asks.
- [Favourite rooms are saved, up to 30](/decisions/server/0058-favourites-saved-up-to-30.md) — Saved per habbo; one
  more gets the client's own text.
- [A deleted room's furni goes to its owner's hand](/decisions/server/0059-a-deleted-rooms-furni-goes-to-its-owner.md)
  — Nothing bought is lost.
- [The navigator's shared data lives in virtual/category, virtual/model and
  virtual/room](/decisions/server/0060-virtual-category-model-and-room.md) — The categories, models and public rooms
  stay in memory.
- [A navigator list shows at most 30 rooms](/decisions/server/0061-navigator-lists-show-up-to-30-rooms.md) — A
  category's habbo rooms and a search's results, two settings.
- [Room passwords are stored hashed](/decisions/server/0062-room-passwords-are-hashed.md) — Entering compares the typed
  password with the hash.
- [Public rooms and habbo rooms have tables of their own](/decisions/server/0063-public-rooms-and-habbo-rooms-apart.md)
  — A habbo room's owner is never empty, and a favourite names one kind or the other.
- [Every program reads settings from the store, and nothing
  refreshes](/decisions/reborn/0006-settings-are-read-from-the-store.md) — Settings come from the store on use, and the
  game checks for waiting database updates on use.
- [A habbo's fuses: everyone's two, Holo's club set, and every checked fuse from access
  groups](/decisions/server/0045-fuses-holos-club-set-and-every-checked-fuse.md) — Club members get the special room
  layouts.
