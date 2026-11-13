---
type: Decision
title: Avatar images from a configurable URL
description: Avatar images come from an imaging URL in config and settings, used by an Avatar primitive in packages/components.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [components, config]
---

# Decision

- `imaging.avatarUrl` (and `imaging.badgeUrl` for user badges) are config keys that settings can override.
- The `Avatar` primitive builds
  `<img src="{avatarUrl}?figure=…&size=…&direction=…&head_direction=…&gesture=…">`; the page passes the URL in.
- It points to an external imager first; an own renderer can replace it later without code changes.

# Context

Holo hotlinked `www.habbo.co.uk/habbo-imaging/avatarimage`, which no longer serves these images, and had no local
avatar imager.

# Consequences

- The imager must understand the dot-format figures (`hd-180-1.ch-215-82…`) written by the v2 avatar editor in
  `packages/cms/public/habbo-editor.iife.js`.
