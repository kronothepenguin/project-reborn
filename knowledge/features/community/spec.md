---
type: Spec
title: Community
description: The community page with random habbos, the news promo, the tag cloud and banners, and the staff page with its two boxes.
status: done
projects: [packages/cms, packages/housekeeping, packages/store, packages/virtual, packages/components]
---

# What

`/community` shows random habbos, the news promo, the tag cloud and the banners. The Me page shows the news promo and
the banners too. `/staff` lists the staff and two BBCode boxes. Staff manage the banners in housekeeping and the
staff boxes in the settings.

# Behaviours

## The community page

- Anyone opens `/community`: Holo's title and the Community sub-tab show (decision holo-port/0017).
- The grid holds 18 random habbos that are not archived, each with its avatar from the imager, linking to its home.
- A habbo's tooltip shows its name, its creation date, its motto and whether it is in the hotel
  ([hotel status](/features/hotel-status/spec.md)).
- The news promo shows the two newest articles' top stories, then the next two as a list, and `More news »`.
- After 10 seconds the next story turns in; the stories wait while the pointer is over them.
- `Users like..` holds the tag cloud, and the form under it searches the tags.
- The banners column shows the enabled banners: each picture and text opens its address in a new window.
- The Me page shows the news promo and the banners column, as the community page does.

## Banners in housekeeping

- Staff with `housekeeping.banners` add a banner: it starts disabled, with Holo's texts and lengths.
- Staff add a banner with no text: it is saved.
- A banner takes an image address and a link address, each an http(s) address or a path of the site.
- An empty banner, a blank address or a script for a link is refused with 422, and the form keeps what was typed.
- Staff save a banner with status enabled: it appears on the community page.
- Staff save a banner with any status other than 1: it is disabled.
- Staff edit a banner: Holo's answer shows on the edit view.
- Staff delete a banner: Holo's question asks about its text first, and the banner goes.
- A banner that is gone answers Holo's failure with 404.
- Each change writes a staff log row with who made it.
- A moderator manages banners; staff without `housekeeping.banners` get Access Denied.
- A new hotel has no banners (decision holo-port/0075).

## The staff page

- Anyone opens the Staff page and housekeeping's Manage Site Banners with its edit and delete views: Holo's title,
  headings, labels and columns show, with the tab or menu place marked.
- Anyone opens `/staff`: every member of the staff-listed groups shows once, sorted by habbo name
  (decision holo-port/0076).
- A hotel with no staff: the staff page lists nobody.
- Each member shows the habbo chosen for its highest listed group, with that group as rank (decision holo-port/0019).
- A member's chosen habbo is archived: the staff page shows the member's first habbo.
- Every habbo of a member is archived: the staff page leaves the member out.
- Each member shows its avatar, its worn badge, its favourite group's badge, its online state, its motto or
  `No motto`, and `Last Visit:`.
- Anyone reads a staff member's Last Visit: it is the last time a session saw the habbo, else its last sign-in.
- A name links to the habbo's home.
- The two boxes show their headings and BBCode bodies without smilies, each in its colour (decision holo-port/0077).
- A white box shows its heading in black on white.
- Staff edit the boxes' headings, bodies and colours in the settings, in the BBCode editor
  (decision holo-port/0092).
- `features.staffPage` is off: the page sends visitors to the landing page.
