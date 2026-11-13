---
type: Spec
title: Habbos
description: A habbo stands in a room of the client opened from the site, and its look and motto, changed on the site or in housekeeping, change in the client at once, through the first service.
status: active
projects: [packages/services, packages/server, packages/cms, packages/housekeeping, packages/reborn, packages/store, packages/config, packages/components, tests/e2e]
---

# What

Each habbo has its Me page, its motto, its look and its profile
([0006](/decisions/holo-port/0006-profiles-per-habbo.md)). The look is changed in the avatar editor, and club members
keep outfits in a wardrobe. Avatar images come from a configurable imager. Staff find any habbo in housekeeping, edit
it, and restore an archived one.

Next:

The user: "create a room where i can see my habbo and allow me to go into cms, open the client, get into a room in the
client, then if i modify my look in the cms, the client (server) should reflect that."

A signed-in habbo opens the client from the site under reborn, enters any room, and sees itself. Its look and motto,
changed on the site or in housekeeping, change in the client at once, for it and for everyone in the room
([0013](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)). It is the first service
([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)).

It builds on [platform](/features/platform/spec.md) and [the client](/features/client/spec.md).

# Behaviours

## Me page

- A signed-in habbo opens `/me`: it shows its avatar, linked to the looks tab, its motto, credits, last sign-in and
  the hotel's state.
- A habbo clicks its motto, types and presses Enter: the motto is saved and shown as text; Esc leaves without saving.
- A habbo saves a motto over 38 characters on `/me`: the old motto stays.
- A habbo has alerts: the oldest shows first, a staff alert as "Message from <short name> Staff" and the others as
  "Notification".
- A habbo dismisses an alert: it goes without a reload, and the next one shows; without JavaScript the dismiss works
  too.
- A habbo has a birthday while `features.birthdayNotifications` is on: the feed wishes it with the right ordinal.

## Looks and profile

- A habbo opens `/account/looks`: Save changes starts closed and opens five seconds after the editor draws a look the
  club allows (decision holo-port/0107).
- A habbo outside the club picks a club item: the club notice shows and Save changes stays closed.
- The editor reports an old figure on the looks tab: the old figure notice shows.
- A habbo saves a look: it shows on `/me` and in the avatar images.
- A club member opens the looks tab: the wardrobe shows `homes.wardrobeSlots` slots; a red arrow keeps the editor's
  look, and a green arrow starts the editor again with the outfit.
- A habbo saves a motto over 32 characters on `/account/profile`: "Sorry, but the motto you have chosen is too long!",
  and the field keeps what was typed.
- A page shows an avatar: its image comes from `imaging.avatarUrl`, the habbo.com imager by default (decision
  holo-port/0032).
- A user with several habbos opens the home of any of them: the Edit button shows (decision holo-port/0065).

## Housekeeping

- Staff with `housekeeping.users` search habbos by name or id, and by email or address with
  `housekeeping.usersPrivate`: archived habbos are listed too.
- Staff open a habbo: its page shows the owner and the owner's other habbos, and the address history with
  `housekeeping.usersPrivate`.
- Staff with `housekeeping.usersEdit` save a habbo's motto, figure or gender: a blank field keeps its value.
- Staff act on a user at or above their own level: the action is refused and logged (decision holo-port/0055).
- Staff restore an archived habbo: it comes back while its user has a free slot, and else "This user can have <n>
  habbos at most." (decision holo-port/0089)

## Next

- Under reborn, a signed-in habbo opens the client from the site, enters a room and sees its habbo.
- A look saved on the site's looks page shows in the client at once, for the habbo and for another habbo in the room; so
  does a motto saved on the motto or profile pages, and a look or motto saved in housekeeping's habbo editor.
- With the separate programs, the same changes reach the game through its `/api/`, and the `/api/` answers 404 without
  the secret.
