# Implementation Plan: CMS Web Application

**Branch**: `014-cms-web-app` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-cms-web-app/spec.md`. Implementation directives: `packages/cms` hosts the CMS; Astro builds the page shells; Go owns routing and all form/AJAX handling; `packages/store` owns persistence and handlers consume its generated operations directly; `packages/config` owns settings; Svelte is used only where the browser must react to the user.

## Summary

Deliver the hotel's web application in `packages/cms` and `apps/cms`: the public homepage with sign-in, registration with username availability, the forgotten-password recovery views, the signed-out and signed-in layouts, and a basic personal page. The branch grows by delivery slice — Slice 1 (this branch) ships the index view with its working sign-in backend; later slices add their pages on the same foundation.

The homepage renders the signed-out shell with the hotel offline and the join and sign-in cards (FR-001–FR-007). The sign-in action verifies the credential with `store.GetUserByUsername` plus bcrypt, throttles failures through the `login_attempts` operations (FR-012), creates a session row and a hardened `__Host-session` cookie (FR-008, FR-011), and redirects to `/me` (FR-010). `internal/router/session.go` holds the session mechanics: cookie build/clear, `Guard` for protected pages, and a lazy purge of revoked/expired rows on handler activity. A double-submit nonce (`__Host-csrf` cookie plus the form's hidden `csrf_token` input) rejects cross-site posts before any credential work. The one process store comes from `store.Must()` (013-store-library addendum) and is obtained by `CMS.Mount`, which wires the router; the app runners stay thin — production reads `config.Must().CMS.Host`/`.CMS.Port`, development hardcodes them, and both serve the mux.

## Technical Context

**Language/Version**: Go 1.27 (workspace modules `packages/cms`, `packages/store`, `packages/config`, `apps/cms`); TypeScript 6 with Astro 7, Svelte 5, and Tailwind 4 in `packages/cms`

**Primary Dependencies**: Go standard library (`net/http`, `html/template`, `crypto/rand`, `crypto/sha256`, `crypto/subtle`, `encoding/base64`); workspace packages `packages/astro` (resolver/template helpers), `packages/store` (generated typed operations and the `Must` accessor), `packages/config` (the `cms` section here; `database` ships with the store accessor); `golang.org/x/crypto/bcrypt`. Frontend dependencies already declared: `astro`, `@astrojs/svelte`, `svelte`, `tailwindcss`, `@tailwindcss/vite`. Development tool: `tools/tw-color` (maps the supplied legacy palette to Tailwind v4 tokens; run via `make tw-color`).

**Storage**: one shared SQLite file through `packages/store`; tables `users`, `sessions`, and `login_attempts` serve the index slice, and `recovery_tokens` arrives with the recovery slice; unix seconds UTC, 0/1 booleans, generated typed operations only. The index slice changes one operation — `PurgeSessions` becomes parameterless, deleting revoked or past-deadline rows using the database clock — regenerated with `go tool sqlc generate` and documented in the OKF bundle.

**Testing**: `go vet ./...` and `go test ./...` from `packages/cms` (handler tests with `httptest`, a temporary store opened with `store.Open`, an inline `astro.Resolver` returning `[[ ]]` templates, plus session/`Guard`/cookie tests); `gofmt -l . && go vet ./... && go test ./...` from `packages/config`; `make test`, `make check-docs`, and a clean `go tool sqlc generate` diff from `packages/store`; frontend verification with `pnpm --filter @project-reborn/cms build` plus the templating skill's placeholder grep. Svelte components arrive in later slices together with the package's `test` script and vitest coverage (constitution IV).

**Target Platform**: server-side Go on Linux/macOS/Windows (pure Go, CGO not required); modern evergreen browsers, desktop-first layout

**Project Type**: web application (Go HTTP backend + Astro/Svelte frontend in one workspace package) plus contributions to the shared store and config layers

**Performance Goals**: bcrypt cost 12 is the dominant sign-in cost and runs once per attempt, including a dummy comparison for unknown usernames; the spec sets no sign-in time target.

**Constraints**: handlers call generated store operations directly; required dependencies are function parameters or process accessors (`store.Must`, `config.Must`); session cookies are `__Host-` with `Path=/`, `HttpOnly`, `Secure`, `SameSite=Strict`, and `Secure` works on `localhost` because browsers treat it as a trustworthy origin; the sign-in POST carries the hidden nonce before credential handling; sessions are purged lazily inside handlers; runtime data reaches templates only through `[[ ]]`; styling is Tailwind utility classes with palette tokens produced by `make tw-color`; passwords are never rendered, logged, or stored in clear.

**Scale/Scope**: eventual CMS — 13 routes (6 page GETs, 5 form actions, 2 JSON endpoints) plus 1 protected client page; 4 tables; 2 Svelte components; single deployment database. Slice 1: 2 routes (`GET /{$}`, `POST /{$}`), 1 page, 3 tables consumed, 0 new tables, 0 Svelte components, 1 config section, 1 `Guard` that becomes live with the first protected page.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Verdict | Evidence |
|---|---|---|
| I. Defined Before Built (NON-NEGOTIABLE) | PASS | Every route, form field, cookie attribute, store operation, and config key is fixed by spec.md and the contracts before implementation. Slice 1 implements the spec's index view exactly; later pages are not built until their slice updates the spec. |
| II. No Silent Interpretation (NON-NEGOTIABLE) | PASS | Every open design question was answered by the user on 2026-09-16 and recorded in research.md (store-direct persistence, session function shape, `store.Must`, nonce, cookie policy, always-offline homepage, lazy purge, member-page scope for later slices, config sections, delivery slices). |
| III. Specification-Driven Development (NON-NEGOTIABLE) | PASS | Artifacts live under `specs/014-cms-web-app/`; delivery slices map to priority user stories (index first); the spec grows as each slice starts. |
| IV. Test & Verification Discipline | PASS | Tests ship with Slice 1: handler, session, `Guard`, nonce, throttle, and purge tests red-green over a temporary store; obsolete tests are rewritten with the behavior in the same pass. Gates are listed under Testing. |
| V. KISS | PASS | Direct store calls in handlers, plain functions in one router file, one session helper, one shared store accessor. |
| VI. YAGNI | PASS (note) | `Guard` ships in Slice 1 and is mounted by the first protected page in Slice 2, per the user's directive; recorded in Complexity Tracking. Everything else serves the index story. |
| VII. SOLID | PASS | Handlers keep one responsibility per route; `session.go` owns only session/cookie mechanics; dependencies are concrete (`*store.Store`) as directed (YAGNI reconciliation). |

**Post-design re-check (Phase 1)**: PASS — the data model, HTTP/persistence/UI
contracts, and quickstart add no module, dependency, or abstraction beyond
those listed above. The `applying-go-patterns`, `templating-astro-pages`,
`building-astro-components`, `adding-config-sections`, `adding-data-persistence`,
`documenting-with-okf`, and `use-modern-go` skill rules are satisfied by the
planned file layout and conventions.

## Delivery Slices

| Slice | Scope | Status |
|---|---|---|
| 1 | Index view and sign-in backend: homepage render, credential verification, session and cookie, remember me, throttle, lazy purge, `Guard` | this branch |
| 2 | Registration with username availability, signed-in layout, personal page, sign-out, client entry | spec updated when the slice starts |
| 3 | Forgotten-password recovery: request view, reset view, `recovery_tokens` | spec updated when the slice starts |

Each slice is independently implementable, testable, and deliverable as an MVP
increment; later slices add pages and files without reworking the Slice 1
foundation.

## Project Structure

### Documentation (this feature)

```text
specs/014-cms-web-app/
├── spec.md              # feature specification
├── plan.md              # this file
├── research.md          # Phase 0 output — resolved decisions
├── data-model.md        # Phase 1 output — entities and page data
├── quickstart.md        # Phase 1 output — build/run/validate guide
├── contracts/           # Phase 1 output
│   ├── http.md          # routes, forms, cookies, statuses, Guard
│   ├── persistence.md   # store operations consumed directly
│   └── ui.md            # layouts, components, pages, assets
├── checklists/
│   └── requirements.md  # specification quality checklist
└── tasks.md             # generated by /speckit.tasks from this plan
```

### Source Code (repository root)

```text
packages/cms/
├── cms.go                          # CMS, New, WithStatic, WithResolver, Mount (store.Must wiring)
├── go.mod                          # x/crypto require
├── astro.config.mjs                # existing; build.format = "file"
├── src/
│   ├── layouts/
│   │   ├── document.astro          # existing shell: sky-200 body, global.css
│   │   ├── signed-out.astro        # centered paper; offline header; fixed footer links
│   │   ├── signed-in.astro         # SLICE 2: top nav + CSRF meta + content
│   │   └── client.astro            # SLICE 2: bare client-popup shell
│   ├── components/
│   │   ├── paper.astro             # white panel container
│   │   ├── card.astro              # default/login variants
│   │   ├── username-availability.svelte   # SLICE 2
│   │   └── motto-editor.svelte     # SLICE 2
│   ├── pages/
│   │   ├── index.astro             # homepage + sign-in, hidden csrf_token input
│   │   ├── register.astro          # SLICE 2
│   │   ├── forgot.astro            # SLICE 3
│   │   ├── reset.astro             # SLICE 3
│   │   ├── me.astro                # SLICE 2
│   │   └── client.astro            # SLICE 2
│   └── styles/global.css           # `@import "tailwindcss"` only
├── public/
│   ├── favicon.ico / favicon.svg   # existing
│   ├── logo.svg / banner-join.svg / login-promo.svg  # existing
│   └── avatar-female.* / avatar-male.*               # SLICE 2
├── internal/router/
│   ├── router.go                   # Router struct (resolver, store) + New
│   ├── index.go                    # GET/POST /{$}: page data, verification, throttle
│   ├── session.go                  # cookies, session create, Guard, lazy purge
│   ├── index_test.go               # handler tests over a temporary store
│   ├── session_test.go             # cookie/session/Guard tests
│   ├── register.go                 # SLICE 2
│   ├── register-username.go        # SLICE 2
│   ├── me.go                       # SLICE 2
│   ├── me-motto.go                 # SLICE 2
│   ├── logout.go                   # SLICE 2
│   ├── client.go                   # SLICE 2
│   ├── forgot.go                   # SLICE 3
│   └── reset.go                    # SLICE 3
└── dist/                           # Astro build output (embedded; rebuilt after UI edits)

packages/config/
├── config.go                       # registers the CMS section
├── cms/cms.go                      # Host, Port (+ defaults/validators)
├── cms/cms_test.go
└── cms_pipeline_test.go

packages/store/
├── queries/sessions.query.sql      # PurgeSessions becomes parameterless
├── sessions.query.sql.go           # regenerated by sqlc
└── knowledge/queries/sessions.md   # documents the CMS handlers as consumers

apps/cms/
├── cmd/cms/main.go                 # config.Must() → cms.New → Mount → serve
├── cmd/cms-dev/main.go             # hardcoded localhost:17387, Astro proxy
├── Makefile                        # dev runner (air + pnpm dev)
└── .air.toml
```

**Structure Decision**: The CMS lives in `packages/cms` (implementation:
handlers, session helpers, Astro pages) and its process in `apps/cms`
(embed/proxy, address, serve), mirroring the workspace rule. Persistence and
the process store accessor belong to `packages/store`; settings belong to
`packages/config`. Slice 1 fills the index files; each later slice adds its
page and route files to the same tree.

## Complexity Tracking

| Addition | Why it is needed | Simpler alternative rejected because |
|---|---|---|
| `Guard` ships in Slice 1 and mounts in Slice 2 | The session pattern needs one validation/refresh entry point, and the first protected page (`/me`) reuses it instead of writing its own session reads. | Deferring it to Slice 2 would duplicate session-reading code in `me.go`. |