---
type: Entity
title: Wardrobe outfit
description: A look a habbo keeps in a numbered slot of the club wardrobe, to dress in again from the account's looks page.
tags: [store, entity, habbo, club]
timestamp: 2026-11-06T22:56:10+00:00
---

# Definition

The club wardrobe keeps outfits per habbo: each slot holds a figure and its gender. A club member stores the avatar
editor's look in a slot of the active habbo, and puts a stored outfit back in the editor to wear it.

# Invariants

- A slot of a habbo holds one outfit; saving in a slot replaces the outfit there.
- Slots start at 1; the upper bound is the setting `homes.wardrobeSlots`, checked in Go.
- Gender is `M` or `F`; the figure uses the dot format of the avatar editor.

# Lifecycle

- Saved from `/account/looks` by a club member, in a slot of the active habbo, over the outfit there.
- Nothing deletes an outfit when the club ends; the wardrobe shows to club members only.
- Deleted with its habbo.

# Vocabularies

None.

# Relations

- Belongs to a [habbo](/entities/habbo.md); stored and worn while its user is in the club
  ([club subscription](/entities/club-subscription.md)).

# Tables

- [wardrobe_outfits](/tables/wardrobe_outfits.md)

# Queries

- [avatars.query.sql](/queries/avatars.md)
