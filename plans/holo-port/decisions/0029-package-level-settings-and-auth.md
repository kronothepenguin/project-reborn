---
type: Decision
title: Settings and auth are package-level; apps take the db on creation
description: Settings live in virtual/settings as a process-wide singleton read through package functions, auth is a set of helpers that receive the db, and app packages take the db as New's first argument with options only for the resolver and the static handler.
status: accepted
timestamp: 2026-10-28T02:41:53+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-28T02:41:53+00:00"}
tags: [virtual, auth, cms, settings]
---

# Decision

- `packages/virtual/settings` holds the settings as a process-wide singleton:
  - `Load(ctx, cfg, db)` builds the values (the declared defaults, then `config.json`, then the rows) and may run
    again;
  - `GetInt`, `GetBool`, `GetString`, their `…Or` variants, `Set(ctx, db, userID, key, value)` and `Reload(ctx, db)`
    keep the semantics of [0024](/decisions/0024-settings-catalogue-and-getters.md);
  - it never keeps the db.
- `packages/auth` is a set of package-level helpers that receive the db, such as `Login(w, r, db, …)`,
  `Sessions(db)` and `Attributes(ctx, db, userID)`. They read their limits from the settings.
- App packages take the db as `New`'s first argument: `cms.New(db, WithResolver(…), WithStatic(…))`. Options exist
  only for what differs between the production and development runners. A future orchestrator, "reborn", will mount
  every app on one mux with one shared db.
- `cms.New` loads the settings, and the CMS imports `settings` and `auth` directly. `cms.Mount` wraps its routes with
  `auth.RealIP`, cross-origin protection, `auth.Sessions` and the maintenance gate.
- `store.FromConfig()` opens the database named by `config.json` for a runner.
- Nothing reloads the settings for now. Reloading comes back with housekeeping or the orchestrator.
- The installer keeps its own config step and opens the database itself after it.

# Context

Supersedes [0024](/decisions/0024-settings-catalogue-and-getters.md) for the shape of the API; its catalogue,
getters, `Set` and row rules stay. The user rejected injecting required dependencies as options (`WithDB`,
`WithSettings`, `WithAuth`) and asked for:

- settings as a singleton or package functions;
- auth as helpers;
- the db as the only value passed on creation, because the orchestrator will share it.

# Consequences

- [0025](/decisions/0025-settings-reads-never-wait.md) applies to the package-level state.
- The runners' `apps/**/cmd/**` files belong to the user and change only when the user asks.
- The CMS runners no longer check for the database before starting, as the user asked, so the CMS's part of
  [0016](/decisions/0016-installer.md)'s "refuse to start" no longer holds: started before the installer, the
  CMS writes a default `config.json` and an empty database.
