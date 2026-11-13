---
type: Spec
title: Club
description: Club is bought on the site and in the client, its gifts are given, and the game shows a player its club at once.
status: planned
projects: [packages/store, packages/server, packages/cms]
---

# What

Club is one feature wherever it is bought or ends ([0010](/decisions/reborn/0010-slices-follow-the-hotels-features.md)).

It builds on [platform](/features/platform/spec.md) and [economy](/features/economy/spec.md).

# Behaviours

Written with the user when the feature is planned.

# Open questions

- From the server's phase S7, as written there: "How club bought in the client meets club bought
  on the site (the port's phase P6). The client's `SCR_BUY` sends which of its three buttons was
  pressed, 1 to 3, not a number of months".
- What of club's gifts is saved.
