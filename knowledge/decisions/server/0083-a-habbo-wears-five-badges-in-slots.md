---
type: Decision
title: A habbo wears up to five badges, in slots
description: The store keeps a slot, 1 to 5, for each badge a habbo wears, as the R26 client's badge window sets them; the site's badge page changes to match.
status: accepted
timestamp: 2026-11-10T19:40:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T19:40:12+00:00"}
tags: [server, badges, store, cms]
---

# Decision

- A habbo wears up to five badges, each in a slot 1 to 5, as the R26 client's badge window sets them (`SETBADGE`) and
  shows them (228).
- The store keeps the slot of each worn badge, in place of one worn badge; the site's badge page, from HoloCMS, changes
  to match (`plans/holo-port`).

# Context

The store, like HoloCMS's badge page, kept one worn badge per habbo. Offered one badge from the first slot or five
slots, the user chose "Five slots": "The store keeps a slot, 1 to 5, per worn badge; the site's badge page then needs a
change (plans/holo-port) to show several. Example: choosing 3 badges in the client shows all 3 in rooms."

# Consequences

- s4-11, split from s4-07, applies it.
