---
type: Decision
title: News images are local art, an address or an upload cut in the browser
description: A news article's 300x187 top-story picture is one of Holo's five local images, an http(s) address, or an upload that housekeeping cuts, fits and previews in the browser and the database keeps.
status: accepted
timestamp: 2026-11-04T01:26:49+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:26:49+00:00"}
tags: [news, housekeeping, store, art]
---

# Decision

- Holo's five unused top-story images join the CMS's public files, and the news form offers them, defaulting to
  `top_story_news.png`.
- The form also takes an http(s) address.
- It also takes an upload: a housekeeping editor cuts the picture to fill a 300x187 frame, or fits it whole inside it,
  and previews it. The browser sends only the finished 300x187 image.
- The server accepts only an image that really is 300x187, re-encodes it, and keeps it in an `images` table of the
  database. The CMS serves it at an address of its own.
- A GIF that is already exactly 300x187 is kept with its animation. Any other picture goes through the editor and becomes
  a still PNG.
- Banners keep an image address, as in Holo.

# Context

Holo's news form defaulted to an image on a dead Habbo host. Offered the five local images and an address, the user
answered: "local five, url and a way to upload an preview it with an area of 300x187, i want to add a new ui that allows
to cut, fit, and preview news images". The user then chose the database over a folder, the browser over the server for
the cutting, keeping an animated GIF that is already 300x187, and an address only for banners.

# Consequences

- The `images` table comes with an update, the first new table since updates exist.
- Copies of the database saved before updates hold the uploaded images too.
