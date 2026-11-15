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

# Layout

| Path | Holds |
| --- | --- |
| `housekeeping.go` | `New`, `Inject`, `Mount` and the attribute of each route |
| `internal/router/` | One file per route, `router.go` with the staff guard and the chrome, `sections.go` with the settings forms, `staff-log.go` with `writeLog` |
| `src/pages/` | One Astro page per Go template, with `[[ ]]` values |
| `src/layouts/housekeeping.astro` | The layout of every page |
| `src/components/` | The components of housekeeping alone |
| `*_test.go` | One test file per page |
