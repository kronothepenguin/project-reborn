---
type: Spec
title: Navigator
description: The navigator's categories and rooms, changed outside the game, reach it at once, and the site shows the rooms the navigator lists.
status: planned
projects: [packages/server, packages/cms, packages/housekeeping, packages/services, packages/virtual, packages/store]
---

# What

The navigator lists Holo's public rooms and the habbos' rooms by category, the busiest first. A habbo searches rooms,
sees its own, three recommended ones and its favourites. With the room-o-matic a habbo creates a room, then edits and
deletes it.

Next:

The navigator is a feature of its own ([0010](/decisions/reborn/0010-slices-follow-the-hotels-features.md)).

The user: "navigator is its own feature." And, of what needs a service: "something like navigator change a lot."

It builds on [habbos](/features/habbos/spec.md).

# Behaviours

## Browsing

- A new hotel opens the navigator: it holds Holo's categories, 12 public rooms and 42 room models
  (decision server/0055).
- A habbo opens a category of public rooms: it sees the categories under it and its public rooms, the busiest first.
- A habbo opens a category of habbo rooms: it sees up to 30 rooms, the busiest first (decision server/0061).
- A habbo hides full rooms: the full rooms leave the list.
- A habbo opens a category its level may not see: nothing opens.
- A habbo reads a category: it shows how many habbos are in its rooms and how many its rooms take.
- A habbo looks into a public room: it sees the names of the habbos inside.

## Room lists

- A habbo opens its own rooms: it sees them, or a note that it has none.
- A habbo searches: it sees up to 30 rooms whose name holds the words or whose owner it names, or a note that none
  matches (decision server/0061).
- A habbo opens the recommended rooms: it sees three habbo rooms drawn at random (decision server/0057).
- An owner hides its name on a room: others see `-` as its owner, and a search by its name skips the room.
- A staff member with `fuse_see_all_roomowners` reads a room that hides its owner: it sees the owner.

## Favourites

- A habbo adds a public room or a habbo room to its favourites: it stays there at its next login
  (decision server/0058).
- A habbo removes a favourite: it leaves the list.
- A habbo with 30 favourites adds one more: it reads "Only 10 favorite rooms allowed!" (decision server/0058).

## Own rooms

- A habbo creates a room with the room-o-matic: it owns the room, which sits in No category until it picks one
  (decision server/0056).
- A habbo with 50 rooms creates one more: it reads "Error creating a private room" (decision server/0056).
- A habbo creates a room with an empty name or one over 50 characters: the room-o-matic refuses it
  (decision server/0056).
- A habbo picks a club model without the club's fuse: the room-o-matic refuses it (decision server/0045).
- An owner sets its room's description, password, furniture rights and 10 to 25 visitors: the room keeps them
  (decision server/0056).
- An owner sets a password: it is stored hashed, and nobody reads it back (decision server/0062).
- An owner changes its room's name, door and category: the room keeps them, in a category its level may use.
- An owner deletes its room: the room and its favourites go, its furni goes to the owner's hand, and the habbos inside
  are sent out (decision server/0059).

# Open questions

- What the feature holds: the navigator changes the game must show at once, and the site's room lists that
  [presence and rooms](/features/presence-and-rooms/spec.md) holds today.
