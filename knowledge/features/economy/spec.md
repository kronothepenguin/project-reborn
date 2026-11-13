---
type: Spec
title: Economy
description: Housekeeping changes credits, tickets and film, the site shows them and spends them in vouchers and purchases, and the game server shows a player its new balance at once.
status: planned
projects: [packages/store, packages/server, packages/cms, packages/housekeeping]
---

# What

Credits, tickets and film are one feature wherever they change
([0010](/decisions/reborn/0010-slices-follow-the-hotels-features.md)).

The user: "credits: housekeeping allow modify credits, cms show credits and allow to spend them and server manages."
And: "what if we make an "economy" slice better, and include everything about economy there?"

It builds on [platform](/features/platform/spec.md) and [habbos](/features/habbos/spec.md).

# Behaviours

Written with the user when the feature is planned.

# Open questions

- The names and the calls of the `Economy` service beyond `SendCredits`, for tickets and film.
