---
type: Note
title: "Badges and achievements: later"
description: Work set aside for badges and achievements: five badges on the site, and achievements.
---

# Five badges on the site

A habbo wears up to five badges in slots, as the R26 client's badge window sets them
([server 0083](/decisions/server/0083-a-habbo-wears-five-badges-in-slots.md)). The site, from HoloCMS, shows one: the
badge of the first slot a habbo fills, on homes, forum posts and the staff page, and its club purchase and
housekeeping's badge tool wear a badge in slot 1, in place of the one there. Every phase of the port is done
([holo-port 0072](/decisions/holo-port/0072-later-work-in-plans-later.md)), so how the site shows the five waits here.

The user chose "Five slots": "The store keeps a slot, 1 to 5, per worn badge; the site's badge page then needs a change
(plans/holo-port) to show several. Example: choosing 3 badges in the client shows all 3 in rooms."

# Achievements

The habbos have no achievements yet ([server 0051](/decisions/server/0051-no-achievements-yet.md)): 436 lists none, the
server sends no 437, and `GETSELECTEDBADGES` (159), which the client sends only after a 437, has no handler. A phase
that brings achievements decides which ones exist, their levels and badges, how a habbo earns them, and what answers
`GETSELECTEDBADGES`.

The user chose "None yet (Recommended)": "436 lists no achievements and the server never sends 437. GETSELECTEDBADGES,
which the client sends only after a 437, then waits for the phase that brings achievements; plans/later.md notes it."
