# @project-reborn/cms

The hotel's web application: Astro builds static page shells, Go owns routing
and injects runtime values through `[[ ]]` placeholders, and the shared store
and session library provide persistence and authentication.

## Slice status (014 — Slice 1)

Built:

- `GET /` — the public homepage with the paper layout, sample game status
  (online count and hotel state), register banner, and sign-in card.
- `POST /` — working sign-in: credential verification, throttling, session
  creation, and redirect to `/me`, with inline errors on failure.
- `GET /me` — a minimal session-protected placeholder showing the username
  (the full personal page and signed-in layout arrive in a later slice).

Deferred to later slices: registration and username availability, the full
personal page, sign-out, password recovery, and the client entry. The homepage
"Register for free" and "I forgot my password/username" links already point at
their final routes (`/register`, `/forgot`).

## Routes

| Route | Handler | Page |
|---|---|---|
| `GET /{$}` | `internal/router/index.go` `HandleIndexView` | `src/pages/index.astro` |
| `POST /{$}` | `internal/router/index.go` `HandleIndexLogin` | reuses `index.html` |
| `GET /me` | `internal/router/me.go` `HandleMeView` | `src/pages/me.astro` |

Route registration lives in `cms.go` `Mount`; public POST actions run behind
the origin check.

## Layouts and components

- `src/layouts/document.astro` — the only `<html>`/`<head>`/`<body>` shell.
- `src/layouts/signed-out.astro` — centered paper, brand/status row, footer.
- `src/components/paper.astro` — a bare container (overridable `background`, default slot); the signed-out layout applies its frame (corners, `mist-400` border, padding, 3px hard shadow).
- `src/components/card.astro` — `default` and `login` variants.

Styling uses Tailwind utility classes only, mapped to the legacy palette with
`tools/tw-color` (`make tw-color` at the repository root); see
`specs/014-cms-web-app/contracts/ui.md` for the authoritative mapping.

## Configuration

Loaded from the environment by `apps/cms/internal/config`; every value has a
development default.

| Variable | Default | Purpose |
|---|---|---|
| `CMS_ADDR` | `localhost:8080` | HTTP listen address |
| `CMS_BASE_URL` | `http://localhost:8080` | Origin check and cookie hardening (`https` selects `__Host-session` + `Secure`) |
| `CMS_DB_PATH` | `habbo.db` | Shared SQLite file |
| `CMS_HELP_URL`, `CMS_TERMS_URL`, `CMS_PRIVACY_URL` | `#` | Navigation/footer links |
| `CMS_FAILURE_MAX`, `CMS_FAILURE_WINDOW`, `CMS_LOCK_DURATION` | `5`, `15m`, `15m` | Sign-in throttling |
| `CMS_PURGE_INTERVAL` | `1h` | Session purge ticker |

## Build and test

```sh
pnpm --filter @project-reborn/cms build   # Astro build into dist/ (embedded by Go)

cd packages/cms
go vet ./...
go test ./...
```
