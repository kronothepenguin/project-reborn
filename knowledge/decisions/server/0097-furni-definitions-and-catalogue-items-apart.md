---
type: Decision
title: Furni definitions and catalogue items have tables of their own
description: The store keeps what a furni is apart from what a catalogue page sells, so a furni is sold on several pages or on none, and a deal is one catalogue item that gives several furni.
status: accepted
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
tags: [server, store, catalogue]
---

# Decision

- The store keeps the furni definitions, what a furni is, its sprite, colours, kind, size, height and whether it is a
  door, tradeable and recyclable, apart from the catalogue items, what a page sells, with its name, description, price
  and place on the page.
- A furni is sold on several pages or on none, and a deal is one catalogue item that gives several furni.

# Context

Holo's `catalogue_items` holds both in one row, 1,372 of them: furni that are not sold sit on page -1, and a deal is a
row named `deal<n>` whose furni are in `catalogue_deals`. 38 sprites repeat in it, and a purchase names its furni by the
sprite. Offered two tables or one as Holo, the user chose "Two tables (Recommended)": "Furni definitions (what a furni
is) apart from catalogue items (what a page sells, and for how much). Example: the Mummy poster is one furni sold on two
pages, Accessories and Halloween; the recycler's Palm Chair and the six present boxes are furni with no catalogue item;
a deal is one catalogue item that gives several furni."

# Consequences

- s5-01 creates the tables and splits Holo's rows into them.
