---
type: Decision
title: A new hotel starts with no news and no banners
description: Holo's welcome article and its two banners are not seeded, so a new hotel shows Holo's empty-news texts until staff write news.
status: accepted
timestamp: 2026-11-04T01:26:49+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:26:49+00:00"}
tags: [news, banners, store]
---

# Decision

- No update writes news articles or banners.

# Context

Holo's installer wrote an "Installation Complete" article with a HoloCMS and RaGEZONE body and a dead image, and two
banners with dead images that linked to `news.php?id=2` and `forum.php`. The user chose "No seeds".

# Consequences

- The news pages show Holo's `No news to display yet.` and `No headlines to display yet.` on a new hotel, and the
  promo and the banners columns show nothing.
