---
type: Spec
title: Furnis, with the catalogue
description: Habbos buy, place, use, trade and recycle furni in the game and take it from the shared inventory on the site; housekeeping edits the catalogue and a habbo's furni, and the furni left out of S5 arrives.
status: planned
projects: [packages/store, packages/virtual, packages/server, packages/housekeeping, packages/cms, packages/installer]
---

# What

Habbos buy furni in Holo's catalogue and keep it in their hand. They place, move, turn, use and pick it up in rooms,
send presents, ride rollers, travel through teleports and write post-its. They trade furni and recycle it for a reward.
On the site, a user takes the furni that no habbo holds from the shared inventory.

Next:

Furni is managed from every side.

The user: "furnis kind of the same, housekeeping allow to modify them, cms manages own furnis and server show and
controls states..."

It builds on [platform](/features/platform/spec.md).

# Behaviours

## Catalogue

- A new hotel, a habbo opens the catalogue: it holds Holo's English pages, furni and deals (decision server/0091).
- Six pages Holo named in Dutch or misspelt, a habbo opens the catalogue: they read Trophies, Christmas, Easter,
  Windows, Dragons and Trophies Rare (decision server/0099).
- A habbo opens the catalogue: it lists the pages the habbo sees, in Holo's order.
- A habbo below level 7 opens the catalogue: the 16 rare pages are hidden (decision server/0100).
- A club member or a habbo of level 2 or more opens the catalogue: Greek and Advertisement show (decision server/0100).
- A habbo opens the catalogue: Pets, Camera and the five Trax pages are absent (decision server/0101).
- A habbo asks for a page it does not see, or one that does not exist: no page comes.
- A habbo with enough credits buys an item: the user's wallet pays, the credit history shows the purchase, and the furni
  is in the habbo's hand.
- A habbo with too few credits buys an item: the purchase is refused and the credits stay.
- A habbo outside the club buys from Club Furni or Club Shop: the client says the page is for club members, and nothing
  is charged (decision server/0102).
- A habbo buys a deal: every furni of the deal is in the hand.
- A habbo buys a trophy: it keeps the buyer's name, the day and the inscription, cut at 150 characters.
- A habbo buys a wallpaper, a floor or a landscape: it keeps the pattern the habbo chose.
- A habbo buys a pad of post-its: the pad holds 20 notes.
- A habbo buys a teleport: two teleports that name each other are in the hand (decision server/0111).

## Hand

- A habbo opens its hand: it shows nine furni a page, the oldest first.
- The site or another habbo gives a habbo furni: it shows the next time the hand opens (decision server/0096).

## In the room

- A habbo enters a habbo room: it sees the floor furni and the wall items that stand there.
- The owner or a habbo with rights places a furni from its own hand: it stands in the room for everyone
  (decision server/0103).
- A habbo places a furni on a tile that takes no furni, or where a habbo stands: it stays in the hand.
- A habbo places a furni on a solid that has a height: it stands on its top, up to 20 high.
- A room holds 500 furni, a habbo places one more: it is refused and stays in the hand (decision server/0104).
- The owner or a habbo with rights moves or turns a furni: everyone sees it in its new place.
- The room's owner, or staff with `fuse_any_room_controller`, picks a furni up: it goes to the picker's hand and becomes
  the picker's, whoever placed it (decision server/0103).
- A room is deleted: its furni goes to its owner's hand (decision server/0059).
- Habbos walk in a furnished room: they walk around a solid, sit on a seat, lie on a bed and walk over a rug.
- A habbo in the room switches a furni, a lamp on: everyone sees its new state.
- A habbo who controls the room opens a gate: it opens, and it closes only while nobody stands in it.
- A habbo rolls a dice, spins the wheel or starts the love randomizer: its number shows after 2, 4.25 or 5 seconds.
- A habbo takes a drink: it carries the drink 9 seconds and sips it 1, ten times over.
- A habbo who controls the room uses a wallpaper, a floor or a landscape: the room shows its pattern, also to habbos who
  come in later.
- The room's owner redeems a credit furni: the furni goes and the wallet gets the number in its name, with a line in the
  credit history; anyone else is refused (decision server/0115).
- A room unloads, or the server restarts: its furni comes back where it stood, with its state.

## Presents

- A habbo buys a furni as a present for a habbo by name: it waits in the receiver's hand, online or not, in one of six
  boxes with the note, and the buyer's credit history names the furni and the receiver (decision server/0094).
- A habbo names a present's receiver that no habbo has: nothing is charged (decision server/0094).
- A habbo writes a present's note longer than 200 characters: the note keeps its first 200 (decision server/0106).
- A receiver is in a room when a present arrives: its hand comes up.
- The room's owner opens a box that stands in its room: the box goes and the furni is in the owner's hand
  (decision server/0105).

## Rollers

- A furni or a habbo stands on a roller: every 2 seconds the roller carries it one tile the way it points, when the next
  tile is free, and a line of rollers passes a row of things along (decision server/0107).

## Teleports

- A habbo steps into a teleport from the tile in front of it: it comes out of the other of the pair, in the same room at
  once.
- A teleport's partner stands in another room: the habbo arrives past the doorbell, the password, a room ban and a full
  room (decision server/0110).
- A teleport's partner is in a hand: the teleport leads nowhere (decision server/0111).

## Post-its

- A habbo with rights places a pad of post-its: one yellow note goes on the wall, and the pad counts one fewer and goes
  with its last.
- A habbo in the room opens a post-it: it reads the note; a habbo with rights writes it and changes its colour
  (decision server/0108).
- A habbo writes a note longer than 684 characters: it is refused and nothing is saved (decision server/0109).
- The room's owner, or staff with `fuse_remove_stickies`, deletes a post-it: it is gone for good
  (decision server/0108).
- A room is deleted: its post-its go with it.

## Trading

- A habbo opens a trade with another habbo, in any room: both see the trade window (decision server/0112).
- A habbo offers a tradeable furni: both see it, both accepts go, and a side offers up to 65 furni
  (decision server/0113).
- A habbo offers a furni that is not tradeable: it is refused.
- A furni is on offer: it stays in the hand and is not placed, used up or recycled (decision server/0114).
- Both habbos accept: every furni on offer changes hands at once (decision server/0092).
- A habbo closes the trade, leaves the room or disconnects, or the server restarts: nothing changes hands
  (decision server/0092).

## Recycler

- A habbo in a room gives the recycler as many recyclable furni as a reward takes: they leave the hand and wait in the
  recycler (decisions server/0093, server/0118).
- A habbo gives the recycler a furni younger than 30 days, or one on offer in a trade: the recycling is refused
  (decisions server/0117, server/0114).
- A recycling is ready after 60 minutes, even across a restart: the habbo takes the reward, and the furni given are
  destroyed (decision server/0093).
- A recycling is 7 days old: the reward is gone, and the habbo cancels and gets its furni back
  (decision server/0116).
- Staff turn the recycler off: no new recycling starts.

## The site's Furni page

- A user opens `/account/furni`: it lists the furni that no habbo holds, a row for each kind with its count
  (decisions server/0122, server/0123).
- A user takes a row, or takes all: that furni moves to the active habbo's hand (decision server/0123).

# Open questions

- The design of the catalogue editor, which [server 0091](/decisions/server/0091-holos-catalogue-changed-by-updates.md)
  left to be asked: what it edits, and how it lives with updates that change the catalogue later.
- What staff may do with a habbo's furni in housekeeping: see it, give it, take it, move it.
- Whether a room limits its post-its and its rollers, and at what numbers.
- One-way doors need their furni in the catalogue, which Holo's does not sell, and the fortune teller its states: where
  each comes from.
