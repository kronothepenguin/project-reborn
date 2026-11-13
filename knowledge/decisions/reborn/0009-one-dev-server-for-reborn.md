---
type: Decision
title: reborn's dev runner proxies one Astro dev server for every site, after a spike proves it
description: A dev-only Astro project in packages/reborn serves the CMS's pages at /, housekeeping's at /housekeeping/ and the installer's at /installer/ from one dev server, so that reborn-dev proxies it as the standalone dev runners proxy theirs; a spike proves it first.
status: accepted
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [platform, dev, astro]
---

# Decision

- `packages/reborn` holds, beside its Go code, a dev-only Astro project that injects the pages of the CMS, housekeeping
  and the installer (Astro's `injectRoute`) under `/`, `/housekeeping/` and `/installer/`. It is never built for a
  release: each site's production build stays its own.
- `reborn-dev` resolves pages and proxies static files from that one dev server, as `cms-dev` does, so every page
  reloads live; `make dev` runs it.
- A spike comes first: one CMS page, one housekeeping page and one installer page, with live reload, styles and Svelte
  components. If it fails, the user is asked before anything else is planned.

# Context

A dev runner cannot proxy two Astro dev servers, since Vite serves paths such as `/@vite/client` at the root whatever
the base (`apps/housekeeping/cmd/housekeeping-dev/main.go`). The user: "we need to serve both frontends the same way we
use others. is there a way to include both projects source within same vite project? like creating a vite project for
reborn that merely imports from cms and housekeeping, as we are in monorepo, this can be done and we can have the same
interface we have for standalone runners." The user chose "Spike first, then build".

# Consequences

- The risks the spike answers: Tailwind's class scanning across folders, and each site's own Astro and Svelte settings.
