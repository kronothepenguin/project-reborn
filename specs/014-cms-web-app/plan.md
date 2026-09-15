# Implementation Plan: CMS Web Application

**Branch**: `014-cms-web-app` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-cms-web-app/spec.md`. Implementation directives from the user: use `packages/cms`; Astro for page templates; Go and the project router for form submissions and AJAX handlers; the store to define data entities; Svelte where the browser needs interactivity.

## Summary

Deliver the hotel's web application in `packages/cms` and `apps/cms`: the public homepage with hotel status and sign-in, registration with live username availability, a neutral forgotten-password request that completes through an emailed single-use reset link, both signed-out and signed-in layouts, and a basic personal page (avatar, username, motto, last sign-in) with an entry to the game client. **Delivery slice:** this branch delivers the index view with working sign-in; the full personal page, registration, sign-out, and recovery remain planned but unbuilt until their slices are requested. Go owns routing and all form/AJAX handling through the `internal/router` package and registers routes in `cms.go` `Mount`; Astro builds the page shells with runtime data injected by `html/template` through `[[ ]]`; Svelte 5 components are used only for the two interactive pieces (username availability, motto editing). All styling uses Tailwind utility classes, with the supplied legacy palette translated to Tailwind v4 tokens by the repository's `tools/tw-color` tool (research R17, [contracts/ui.md](./contracts/ui.md)). User accounts, sessions, recovery tokens, and login-attempt counters are declared in the shared store under domain-named families (`users`, `sessions`, `recovery-tokens`, `login-attempts`) and consumed through generated typed operations; sessions use the existing `packages/auth` library through a thin CMS-internal adapter. No deferred content area (tags, mailbox, events, news, groups, credits, club, community, account settings) is built.

## Technical Context

**Language/Version**: Go 1.27 (workspace modules `packages/cms`, `packages/auth`, `packages/store`, `apps/cms`); TypeScript 6 with Astro 7, Svelte 5, and Tailwind 4 in `packages/cms`

**Primary Dependencies**: Go standard library (`net/http`, `html/template`, `net/mail`); workspace packages `packages/astro` (resolver/template helpers), `packages/auth` (session lifecycle, CSRF, middleware), `packages/store` (persistence infrastructure); `golang.org/x/crypto/bcrypt` (new, for password hashing). Frontend dependencies already declared: `astro`, `@astrojs/svelte`, `svelte`, `tailwindcss`, `@tailwindcss/vite`. Development tool: `tools/tw-color` (maps the supplied legacy palette to Tailwind v4 tokens; run via `make tw-color`)

**Storage**: One shared SQLite file through `packages/store`; new additive domain-named schema families `users` (users), `sessions` (sessions), `recovery-tokens` (recovery_tokens), and `login-attempts` (login_attempts); unix seconds UTC, 0/1 booleans, generated typed operations only (the index slice creates `users`, `sessions`, and `login-attempts`; `recovery-tokens` ships with the recovery slice)

**Testing**: `go vet ./...` and `go test ./...` from `packages/cms` (unit tests for the account service and auth adapter; end-to-end handler tests with `httptest`, a temporary store, a recording mailer, a fake status provider, and an inline template resolver) and from `packages/store` (`make test`, `make check-docs`, regeneration clean-diff); frontend verification with `pnpm --filter @project-reborn/cms build` plus the templating skill's placeholder grep

**Target Platform**: server-side Go on Linux/macOS/Windows (pure Go, CGO not required); modern evergreen browsers, desktop-first layout

**Project Type**: web application (Go HTTP backend + Astro/Svelte frontend in one workspace package) plus contributions to the shared persistence layer

**Performance Goals**: sign-in reaches the personal page within 2 s (SC-003); username availability answers within 1 s (SC-002); page interactions (motto, forms) complete without a full reload within 1 s (interaction budget); bcrypt cost 12 accepted as the dominant sign-in cost

**Constraints**: additive idempotent DDL only; no ad-hoc SQL outside the store; runtime data only through `[[ ]]` placeholders; Svelte only where the browser reacts; no new JS test runner in this slice, but the deferred Svelte components add one with their tests (constitution IV); passwords and reset tokens never rendered, logged, or stored in clear; same-origin check on public unsafe routes; `CMS_BASE_URL` scheme toggles cookie hardening so production runs `__Host-` + `Secure`; Tailwind utility classes only with palette tokens produced by `make tw-color` (R17) and no custom CSS beyond `@import "tailwindcss"`

**Scale/Scope**: eventual — 13 routes (6 page GETs, 5 form actions, 2 JSON endpoints) plus 1 protected client page within that set; 4 tables; 2 Svelte components; 1 domain service; 1 auth adapter; single deployment database. Index slice: 2 routes plus the minimal `/me` placeholder, 3 tables, 0 Svelte components.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Verdict | Evidence |
|---|---|---|
| I. Defined Before Built (NON-NEGOTIABLE) | PASS | Every page, route, field, table, and message shape is fixed by spec.md, data-model.md, and the contracts before implementation; research R3/R7/R8 record the only decisions the spec left implicit (reset completion, client entry, avatar rendering) with alternatives. |
| II. No Silent Interpretation (NON-NEGOTIABLE) | PASS | The three spec clarifications are recorded (C1–C3); every remaining ambiguity is surfaced in research.md as an explicit decision instead of a silent guess. No `NEEDS CLARIFICATION` remains. |
| III. Specification-Driven Development (NON-NEGOTIABLE) | PASS | Artifacts live under `specs/014-cms-web-app/`; user stories map to the route/page inventory with P1 requirements first; no complexity beyond the minimal structure is introduced. |
| IV. Test & Verification Discipline | PASS (gate note) | Go tests are defined per story (account service, adapter, end-to-end handlers) and are written red-green; gates are `go vet`/`go test` per module, store regeneration clean-diff, `make check-docs`, and the frontend build. Constitution IV's vitest gate is not exercisable in this slice because `packages/cms` has no test script and the index slice adds no JS behavior (R13); the two deferred Svelte components MUST add the `test` script and vitest coverage before their slices ship. |
| V. KISS | PASS | One domain package, one adapter, one router package; direct generated store calls; inline page forms; two Svelte components; no framework, no repository layer, no background service beyond one purge ticker. |
| VI. YAGNI | PASS | No content cards, no figure composer, no SSO ticket, no shared mail package, no JS test runner in this slice, no speculative status integration; each deferred item is listed in research alternatives for when its feature arrives. |
| VII. SOLID | PASS | Handlers are one per route (single responsibility); the account service holds credential/validation policy only; the auth adapter implements seven segregated interfaces; consumers define the narrow interfaces they use (`Mailer`, `status.Provider`); routing depends on abstractions supplied at `Mount`. |

**Post-design re-check (Phase 1)**: PASS — data-model.md, the HTTP/persistence/UI contracts, and quickstart.md add no modules, dependencies, or abstractions beyond those listed above. The UI contract now fixes the document/signed-out/index/card visual specification, and R17 maps every supplied legacy color to a Tailwind v4 token verified against the installed `tailwindcss@4.3.3` theme; the skill rules (`applying-go-patterns`, `templating-astro-pages`, `building-astro-components`, `adding-svelte-interactivity`, `adding-data-persistence`, `documenting-with-okf`) are satisfied by the planned file layout and conventions.

## Project Structure

### Documentation (this feature)

```text
specs/014-cms-web-app/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output — 17 resolved decisions
├── data-model.md        # Phase 1 output — entities, tables, operations
├── quickstart.md        # Phase 1 output — build/run/validate guide
├── contracts/           # Phase 1 output
│   ├── http.md          # routes, forms, JSON, middleware, statuses
│   ├── persistence.md   # SQL operations and auth adapter contract
│   └── ui.md            # layouts, components, pages, assets
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
packages/cms/
├── cms.go                          # public API: CMS, New, Mount, options, Purge (extend existing)
├── go.mod                          # adds packages/auth, packages/store, x/crypto requires
├── astro.config.mjs                # existing (build.format = "file")
├── package.json                    # existing scripts
├── src/
│   ├── layouts/
│   │   ├── document.astro          # existing; body background sky-200
│   │   ├── signed-out.astro        # centered paper + online/status row + footer
│   │   ├── signed-in.astro         # top nav + CSRF meta + content
│   │   └── client.astro            # bare client-popup shell
│   ├── components/
│   │   ├── paper.astro             # white panel: mist-400 border + 3px hard shadow
│   │   ├── card.astro              # existing; default/login variants, 3px hard shadow
│   │   ├── username-availability.svelte
│   │   └── motto-editor.svelte
│   ├── pages/
│   │   ├── index.astro             # public homepage + sign-in (replaces scaffold)
│   │   ├── register.astro
│   │   ├── forgot.astro
│   │   ├── reset.astro
│   │   ├── me.astro
│   │   └── client.astro
│   └── styles/global.css           # existing
├── public/
│   ├── favicon.ico / favicon.svg   # existing
│   ├── avatar-female.*             # static registration option + personal avatar
│   └── avatar-male.*
├── internal/
│   ├── router/
│   │   ├── router.go               # Deps + Router
│   │   ├── middleware.go           # origin check, page/API Protect wiring helpers
│   │   ├── index.go                # GET/POST /{$}
│   │   ├── register.go             # GET/POST /register
│   │   ├── register-username.go    # GET /register/username (JSON)
│   │   ├── forgot.go               # GET/POST /forgot
│   │   ├── reset.go                # GET/POST /reset
│   │   ├── me.go                   # GET /me
│   │   ├── me-motto.go             # POST /me/motto (JSON)
│   │   ├── logout.go               # POST /logout
│   │   └── client.go               # GET /client
│   ├── account/
│   │   ├── account.go              # Service: register, authenticate, motto, recovery, reset
│   │   ├── validate.go             # field validation and error messages
│   │   └── hash.go                 # bcrypt hasher (cost setting)
│   ├── authstore/
│   │   └── authstore.go            # auth persistence interfaces over *store.Store
│   ├── mail/
│   │   ├── mail.go                 # concrete senders: Send(ctx, to, subject, body)
│   │   ├── smtp.go                 # SMTP sender
│   │   └── outbox.go               # filesystem outbox fallback
│   └── status/
│       └── status.go               # Offline provider: Snapshot(ctx) (up, online, err)
└── dist/                           # Astro build output (embedded)

packages/store/
├── schema/users.schema.sql             # users
├── schema/sessions.schema.sql          # sessions
├── schema/recovery-tokens.schema.sql   # recovery_tokens
├── schema/login-attempts.schema.sql    # login_attempts
├── queries/users.query.sql             # user account operations
├── queries/sessions.query.sql          # session operations
├── queries/recovery-tokens.query.sql   # recovery token operations
├── queries/login-attempts.query.sql    # throttling operations
├── models.go / *.query.sql.go          # regenerated by sqlc (committed)
└── knowledge/
    ├── schemas/{users,sessions,recovery-tokens,login-attempts}.md
    └── queries/{users,sessions,recovery-tokens,login-attempts}.md

apps/cms/
├── cmd/cms/main.go                 # production: embed dist, open store, configure deps, serve
├── cmd/cms-dev/main.go             # dev: proxy Astro, same deps
├── internal/config/config.go       # env loader with CMS_* defaults (research R11)
└── Makefile                        # existing dev target
```

**Structure Decision**: The feature extends the existing `packages/cms` web package and its `apps/cms` runner; persistence contributions go to `packages/store`; session lifecycle stays in `packages/auth` and is consumed through a CMS-internal adapter. This mirrors the workspace rule that packages own implementation and apps own the process, and keeps every new file inside the established directories.

## Complexity Tracking

No constitution violations. The plan adds one workspace dependency (`golang.org/x/crypto`) and no new module, service, or abstraction beyond the single domain service and adapter described above.
