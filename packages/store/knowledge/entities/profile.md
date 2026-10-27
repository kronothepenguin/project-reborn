---
type: Entity
title: Profile
description: A habbo's web presence, which anchors its home page and its tags.
tags: [store, entity, profiles]
timestamp: 2026-10-27T21:28:26+00:00
---

# Definition

Every habbo has one profile: the public side of the habbo on the site, reached at `/home/{name}`. The profile
owns the habbo's [home](/entities/home.md) and its tags.

# Invariants

- One profile per habbo.
- Tags are lowercase `[a-z0-9]`, 2–20 characters, unique per profile, at most `homes.maxTags` per profile
  (validated in Go).

# Lifecycle

- Created with the habbo, together with its home.
- Tags are added and removed by the owner.
- Deleted with the habbo, which deletes its tags and home.

# Vocabularies

None.

# Relations

- Belongs to a [habbo](/entities/habbo.md); owns a [home](/entities/home.md).

# Tables

- [profiles](/tables/profiles.md)
- [profile_tags](/tables/profile_tags.md)
