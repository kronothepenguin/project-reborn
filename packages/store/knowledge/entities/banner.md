---
type: Entity
title: Banner
description: A promotional banner shown in the side column of the Me and community pages.
tags: [store, entity, site]
timestamp: 2026-11-04T01:38:16+00:00
---

# Definition

Banners are images linking elsewhere, managed in housekeeping and shown while enabled, by `position` and then in the order
they were added, as Holo showed them.

# Invariants

- Only users with `housekeeping.banners` change banners.

# Lifecycle

- Created, edited, disabled and deleted from housekeeping.

# Vocabularies

None.

# Relations

None.

# Tables

- [banners](/tables/banners.md)

# Queries

- [site.query.sql](/queries/site.md)
