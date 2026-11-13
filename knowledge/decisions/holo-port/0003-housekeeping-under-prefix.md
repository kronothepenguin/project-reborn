---
type: Decision
title: Housekeeping under /housekeeping
description: Every housekeeping route lives under /housekeeping/ so it can share one mux and the session cookie with the CMS.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [housekeeping, routing]
---

# Decision

- `packages/housekeeping` registers only `GET|POST /housekeeping/...` routes and serves its `dist` through
  `mux.Handle("/housekeeping/", http.StripPrefix(...))`. It never registers `/`, which the CMS owns.
- Its `astro.config.mjs` sets `base: "/housekeeping"`; the dev runner's resolver base URL includes `/housekeeping`.
- There is no separate housekeeping login: it uses the shared `packages/auth` session.
- `apps/housekeeping` still runs it alone on its own port.

# Context

Holo's admin panel lived in the `/housekeeping/` folder with its own login and a second session that held the
password hash.

# Consequences

- Access is decided by attributes ([0014](/decisions/0014-attribute-based-access.md)).
