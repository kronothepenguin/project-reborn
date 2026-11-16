---
type: Go Package
title: housekeeping
description: The Go package of the staff panel, an Astro frontend embedded in Go, what its New does, and how Inject hands it its services.
---

# The package

Astro (Svelte + Tailwind) frontend embedded in a Go module. The `Housekeeping` struct registers a router over
`packages/astro` resolvers and serves the built frontend from the embedded `dist/`.

# New

- `housekeeping.New(db, WithResolver(…), WithStatic(…))` takes the db the runner opened with `store.FromConfig()` and
  loads the settings (`virtual/settings`), panicking when it cannot. Only the resolver and the static handler are
  options.
- A task on `packages/scheduler` deletes expired sessions every minute.

# Inject

- `Inject(housekeeping.Services{Habbos: …})`, once after `New` and before `Mount`, hands housekeeping the services that
  tell the game server of the changes it must show live (`packages/services/knowledge/index.md`). `Mount` gives them to
  the router.
- A service no runner injected is nil, and housekeeping skips its calls.
- The habbo editor (`POST /housekeeping/habbos/{id}`) calls `Habbos.SendLook` once after its transaction commits, and
  never after a refused save.
- The call has a context of its own of 2 seconds, apart from the request's, so a request the visitor abandons still
  tells the game. A failure is logged, and the page answers as it would without the game.

# Layout

| Path | Holds |
| --- | --- |
| `housekeeping.go` | `New`, `Inject`, `Mount` and the attribute of each route |
| `internal/router/` | One file per route path, named without `/housekeeping`. `router.go` holds the staff guard, the chrome, `writeLog`, and `fail` and `logError`, which log every error but `context.Canceled`, so a request the visitor abandoned ends quietly. `settings.go` also holds the settings forms |
| `src/pages/` | One Astro page per Go template, with `[[ ]]` values |
| `src/layouts/housekeeping.astro` | The layout of every page |
| `src/components/` | The components of housekeeping alone |
| `*_test.go` | One test file per page |
