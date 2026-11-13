---
type: Spec
title: Badges and achievements
description: The site shows a habbo's five worn badges, and habbos earn achievements.
status: planned
projects: [packages/store, packages/server, packages/cms, packages/housekeeping]
---

# What

Staff give and remove a habbo's badges in housekeeping. A habbo wears up to five badges in slots, set in the client's
badge window, and its room sees them. The site shows one: the badge of the first slot the habbo fills. A habbo has no
achievements yet.

Next:

The five badge slots of the client show on the site, and achievements exist
([later](/features/badges-and-achievements/later.md), "Five badges on the site" and "Achievements").

# Behaviours

- Staff with `housekeeping.usersEdit` give a habbo of a user below them a badge of 3 to 4 letters or digits: the habbo
  gets it in upper case and wears it in slot 1, in place of the badge there, and the staff log keeps it.
- Staff give a badge the habbo already has: it becomes the worn one, with Holo's message.
- Staff give a code of another length or with other characters: Holo's
  "Invalid badge. Badge codes may only be 3-4 characters long." shows.
- Staff remove a badge of a habbo: it goes, whatever gave it, and the staff log keeps it.
- Staff remove a badge the habbo lacks: the answer is 404.
- Staff act on the badges of a user at or above their level: the change is refused.
- A habbo sets its badges in the client's badge window: it wears up to five, in slots 1 to 5, its room sees them, and
  the store keeps them (decision server/0083).
- A habbo logs in and asks its badges: the answer lists its badges and the worn ones with their slots (decision
  server/0053).
- A visitor reads a habbo's home, a forum post or the staff page: the badge of the first slot the habbo fills shows.
- A habbo asks its achievements in the client: the list is empty (decision server/0051).

# Open questions

- Which achievements the hotel has and what earns each; the client's cast for them is not among the casts the server
  reads ([server 0051](/decisions/server/0051-no-achievements-yet.md)).
