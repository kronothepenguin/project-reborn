---
type: Decision
title: Slices follow the hotel's own features, and habbos comes first
description: The economy and club are separate slices, furni with its catalogue is furnis, friends is the messenger, and habbos, rooms and navigator are slices of their own; the habbos slice is the first feature built, end to end from the site to the client.
status: accepted
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [process, slices]
---

# Decision

- The basic slices are the hotel's features: economy, club, furnis (with the catalogue), rooms, habbos, navigator and
  messenger. More follow as they come.
- "Credits and club" becomes economy (`plans/reborn/slices/economy.md`), for credits, tickets, film, vouchers and the site's
  purchases, and club (`plans/reborn/slices/club.md`). "Furni and the catalogue" becomes furnis (`plans/reborn/slices/furnis.md`). "Friends and the
  messenger" becomes messenger (`plans/reborn/slices/messenger.md`). Habbos (`plans/reborn/slices/habbos.md`), rooms (`plans/reborn/slices/rooms.md`) and
  navigator (`plans/reborn/slices/navigator.md`) are new; what presence and rooms (`plans/reborn/slices/presence-and-rooms.md`) holds goes to them
  when they start.
- The habbos slice comes first: a habbo seen in a room of the client opened from the site, whose look and motto,
  changed on the site, change in the client at once.

# Context

The user: "what if we make an "economy" slice better, and include everything about economy there?", then chose it; and
later: "catalogue is its own feature under furnis feature, navigator is its own feature. [...] i will list some of the
independent slices here: - economy - club - furnis - rooms - habbos - rooms - navigator - messenger. there are many
more, but this might be the basics."

And: "you know what. let's start with habbos slice only. create a room where i can see my habbo and allow me to go into
cms, open the client, get into a room in the client, then if i modify my look in the cms, the client (server) should
reflect that."

# Consequences

- The pointers of the history bundles to the renamed slices are corrected in place.
- The habbos slice needs reborn's core from platform (`plans/reborn/slices/platform.md`) and the client page from
  the client (`plans/reborn/slices/client.md`), whose tasks come first.
