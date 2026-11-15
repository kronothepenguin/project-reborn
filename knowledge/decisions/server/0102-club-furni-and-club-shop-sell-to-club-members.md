---
type: Decision
title: Club Furni and Club Shop sell only to club members
description: Everyone sees the Club Furni and Club Shop pages, and only a club member buys from them; anyone else gets 296 with 1, the client's own message, and pays nothing.
status: accepted
timestamp: 2026-11-11T15:38:49+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:38:49+00:00"}
tags: [server, catalogue, club]
---

# Decision

- Everyone sees the pages Club Furni and Club Shop, and only a club member buys from them.
- A habbo that is not in the club gets 296 with 1, for which the client shows its text
  `catalog_purchase_not_allowed_hc`, and pays nothing.

# Context

Holo sold both pages to anyone and never sent 296. Offered club members only or anyone as Holo, the user chose "Club
members only (Recommended)": "Everyone sees the two pages, and only a club member can buy from them; anyone else gets
the client's own 'only for club members' message and pays nothing. Example: Ana, not in the club, clicks Buy on the Club
Sofa and the client tells her to join the club."

# Consequences

- s5-01 marks such a page, and s5-05 refuses the
  purchase.
