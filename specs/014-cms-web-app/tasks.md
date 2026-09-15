---
description: "Task list for the CMS Web Application — index view slice"
---

# Tasks: CMS Web Application — Index View Slice

**Input**: Design documents from `/specs/014-cms-web-app/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Slice scope (clarifications 2026-09-12)**: build the index view with a working sign-in — homepage rendering (paper layout, sample status row, register banner, login card), credential verification, session creation, redirect to `/me`, inline errors, and throttling. In this slice `/me` is a minimal protected placeholder (username only); the full personal page, registration, sign-out UI, and recovery are deferred to later slices, and the public links already point at their final routes (`/register`, `/forgot`) and return not-found until those slices ship.

**Tests**: REQUIRED — constitution IV (Test & Verification Discipline) and the plan's Testing section; write tests first and observe them fail before implementing.

**Organization**: Setup → Foundational (index-slice subset) → US1a (sign in from the homepage) → Polish. US1b (registration), US2, and US3 do not receive task phases until their slices are clarified.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1a for this slice; US1b, US2, and US3 arrive with later slices)
- Every task names the exact file path it creates or edits

## Path Conventions

Repository-root relative paths, per plan.md: `packages/cms/` (Go root API in `cms.go`, routes in `internal/router/`, domain in `internal/`, frontend in `src/`), `packages/store/` (`schema/`, `queries/`, `knowledge/`), `apps/cms/` (`cmd/cms/`, `cmd/cms-dev/`, `internal/config/`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Slice dependencies, app configuration, and scaffold cleanup

- [x] T001 Add the `golang.org/x/crypto` requirement to `packages/cms/go.mod` and run `go work sync` from the repository root
- [x] T002 [P] Create the environment config loader in `apps/cms/internal/config/config.go` with defaults for `CMS_ADDR`, `CMS_BASE_URL`, `CMS_DB_PATH`, `CMS_HELP_URL`, `CMS_TERMS_URL`, `CMS_PRIVACY_URL`, `CMS_FAILURE_MAX`, `CMS_FAILURE_WINDOW`, `CMS_LOCK_DURATION`, `CMS_PURGE_INTERVAL` (research R11)
- [x] T003 [P] Delete the scaffold `packages/cms/src/components/counter.svelte` and remove the unused `Card` import from `packages/cms/src/pages/index.astro`
- [x] T004 [P] Add placeholder assets `packages/cms/public/logo.svg`, `packages/cms/public/banner-join.svg`, `packages/cms/public/login-promo.svg` matching the layout surfaces reserved in `contracts/ui.md` (missing assets must never render a broken image; avatars and later assets arrive with their slices)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persistence, auth adapter, account core, app wiring, and UI primitives the index slice needs

**⚠️ CRITICAL**: No US1a work can begin until this phase is complete

### Store layer (only the families the slice uses)

- [x] T005 [P] Write `packages/store/schema/users.schema.sql` declaring the full `users` table from `data-model.md` (the store is additive-only, so every column is declared now)
- [x] T006 [P] Write `packages/store/schema/sessions.schema.sql` declaring `sessions`, `idx_sessions_user_id`, `idx_sessions_absolute_expires_at`
- [x] T007 [P] Write `packages/store/schema/login-attempts.schema.sql` declaring `login_attempts`
- [x] T008 [P] Write `packages/store/queries/users.query.sql` with `CreateUser`, `GetUserByUsername`, and `MarkUserSignedIn` (registration slice extends this file later; `GetUserByID` was included for the `/me` placeholder)
- [x] T009 [P] Write `packages/store/queries/sessions.query.sql` with all six session operations from `contracts/persistence.md` (the auth adapter is one cohesive unit)
- [x] T010 [P] Write `packages/store/queries/login-attempts.query.sql` with `UpsertLoginFailure`, `GetLoginAttempt`, `LockLoginAttempt`, and `ClearLoginAttempt`
- [x] T011 Run `go tool sqlc generate` from `packages/store` and commit the generated `users.query.sql.go`, `sessions.query.sql.go`, `login-attempts.query.sql.go`, and `models.go` changes
- [x] T012 [P] Document the three schema files as OKF concepts in `packages/store/knowledge/schemas/{users,sessions,login-attempts}.md` and update `packages/store/knowledge/schemas/index.md`
- [x] T013 [P] Document the three query files as OKF concepts in `packages/store/knowledge/queries/{users,sessions,login-attempts}.md` and update `packages/store/knowledge/queries/index.md`
- [x] T014 Run `make check-docs`, `go vet ./...`, and `go test ./... -race` from `packages/store`; fix any conformance or resource-path failure

### Domain and adapter foundations (red-green)

- [x] T015 [P] Write failing adapter tests in `packages/cms/internal/authstore/authstore_test.go` (create, validate absent/revoked, touch, idempotent revoke, revoke-account with survivor, list, purge)
- [x] T016 [P] Write failing hasher tests in `packages/cms/internal/account/hash_test.go` (hash/compare round-trip, wrong password, injectable cost)
- [x] T017 [P] Write failing status tests in `packages/cms/internal/status/status_test.go` asserting the sample values clarified for this slice (sample count and online)
- [x] T018 [P] Write failing middleware tests in `packages/cms/internal/router/middleware_test.go` (origin present and matching passes, mismatched rejects `403`, absent passes)
- [x] T019 Implement `packages/cms/internal/authstore/authstore.go` implementing `auth.Creator`, `Validator`, `Toucher`, `Revoker`, `AccountRevoker`, `Lister`, `Purger` over `*store.Store` per `contracts/persistence.md`
- [x] T020 [P] Implement `packages/cms/internal/account/hash.go` (bcrypt, default cost 12, injectable cost for tests) per research R2
- [x] T021 [P] Implement `packages/cms/internal/status/status.go` with the `Provider` interface and the sample provider (`Status{Up: true, Online: 12345}`) per research R9 and the 2026-09-12 clarification
- [x] T022 Implement `packages/cms/internal/account/account.go` core: `Service` struct, canonicalization, and the credential error taxonomy
- [x] T023 Implement `packages/cms/internal/router/router.go` (`Deps{Resolver, Accounts, Sessions, Status, BaseURL, Links}`) and `packages/cms/internal/router/middleware.go` (origin check) per `contracts/http.md`
- [x] T024 Create the shared handler-test template resolver in `packages/cms/internal/router/export_test.go` returning inline `[[ ]]` templates

### UI primitives

- [x] T025 Update `packages/cms/src/layouts/document.astro` (`bg-sky-200`, `min-h-screen`, neutral base text)
- [x] T026 [P] Create `packages/cms/src/components/paper.astro` (`bg-white`, `border-mist-400`, 3px hard shadow, `rounded-md`, default slot)
- [x] T027 [P] Create `packages/cms/src/layouts/signed-out.astro` (centered paper, logo/status/sample-count row, two-row footer; consumes the shared layout data `.Online`, `.IsUp`, `.TermsURL`, `.PrivacyURL`) per `contracts/ui.md`
- [x] T028 [P] Rewrite `packages/cms/src/components/card.astro` with the `variant` prop (`default`/`login`), `p-2`, `rounded-md`, 3px hard shadow, centered title slot, and `p-2` content slot

### Public API and app wiring

- [x] T029 Extend `packages/cms/cms.go`: options `WithStore`, `WithBaseURL`, `WithStatus`, `WithLinks`, `WithLoginPolicy`; construct the account service and auth adapter; derive cookie hardening from `CMS_BASE_URL` (research R11); build the router in `Mount`; register the static handler last
- [x] T030 Wire `apps/cms/cmd/cms/main.go` and `apps/cms/cmd/cms-dev/main.go` to load `apps/cms/internal/config`, open the store, build the CMS, mount, serve, and run the session purge ticker (`CMS.Purge`)
- [x] T031 Run `go build ./...` and `go vet ./...` from `packages/cms` and `apps/cms`, then `pnpm --filter @project-reborn/cms build`; fix foundation issues

**Checkpoint**: Store families generate cleanly, adapter/hasher/status/middleware tests are green, the app boots, and the shared layouts/components build

---

## Phase 3: User Story 1a - A visitor signs in from the homepage (Priority: P1 — Slice 1)

**Goal**: The index view renders as specified (paper layout, sample status row, register banner, login card) and its sign-in form verifies credentials, creates a session, redirects to `/me`, shows inline errors, and throttles failures

**Independent Test**: From a fresh database with one seeded user, `GET /` renders the homepage with the paper, sample status values, banner, and login card; `POST /` with correct credentials returns `303 /me` and a session cookie; wrong credentials re-render with a generic error and the retained username; repeated failures lock the key; a cross-site `Origin` is rejected with `403`

### Tests for User Story 1a

- [x] T032 [P] [US1a] Write failing service tests for credential verification, last-signed-in update, and throttle lock/clear in `packages/cms/internal/account/authenticate_test.go`
- [x] T033 [P] [US1a] Write failing handler tests for the homepage and sign-in in `packages/cms/internal/router/index_test.go` (rendered status/count/values, offline state from a failing status provider, `303 /me` plus session cookie on success, generic failure with retained username, throttled message, never echoing the password)

### Implementation for User Story 1a

- [x] T034 [US1a] Add `Authenticate` to `packages/cms/internal/account/account.go` (canonical lookup, bcrypt compare, update last signed-in, per-user/per-address throttle with generic failure and lock)
- [x] T035 [US1a] Implement `packages/cms/internal/router/index.go` (`HandleIndexView` with status, offline state when the provider errors or reports down (R9), and shared layout links data; `HandleIndexLogin` with `remember` support, `auth.Create`, `303 /me`, and per-field errors)
- [x] T036 [US1a] Register `GET /{$}` and `POST /{$}` in `packages/cms/cms.go` `Mount` and apply the origin check to the login POST
- [x] T036b [US1a] Register `GET /me` in `packages/cms/cms.go` `Mount` with a minimal `packages/cms/src/pages/me.astro` placeholder (signed-in username only; the full personal page is deferred) behind the session-protected handler, and add `packages/cms/internal/router/me_test.go` asserting anonymous requests redirect `303 /` and signed-in requests render `200` with the username
- [x] T037 [P] [US1a] Build `packages/cms/src/pages/index.astro`: two-column grid, register banner card with the join link to `/register`, and the login card usage from `contracts/ui.md` (title "Sign In", register link `/register`, forgotten-password link `/forgot`) with `[[ ]]` data
- [x] T038 [US1a] Run the US1a Go tests from `packages/cms` and the frontend build; verify the built page keeps `[[ ]]` placeholders and the sample status renders

**Checkpoint**: The index slice is independently demonstrable: homepage renders, sign-in verifies against a seeded user, sessions are created, `/me`'s placeholder is reached, errors and throttling behave, deferred links point at their final routes

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Slice documentation, gates, and end-to-end validation

- [x] T039 [P] Replace the Astro starter `packages/cms/README.md` with the CMS package overview (routes built so far, layouts, config, slice status)
- [x] T040 Run all slice gates: `go tool sqlc generate` + `git diff --exit-code`, `make check-docs`, `go test ./... -race` from `packages/store`; `go vet ./...` and `go test ./...` from `packages/cms`; `go build ./...` from `apps/cms`; `pnpm --filter @project-reborn/cms build`
- [x] T041 Execute `specs/014-cms-web-app/quickstart.md` scenario S1 and the sign-in portions of S3 against a fresh `/tmp` database (sample status, seeded user, `303 /me`, generic failure, throttle)
- [x] T042 [P] Security pass across `packages/cms/`: no password or session secret is rendered or logged, the origin check guards the login POST, throttle keys are per-user and per-address, and cookies follow `CMS_BASE_URL` hardening
- [x] T043 [P] Final cleanup: rebuild `packages/cms/dist`, confirm no deferred page content (register/forgot) leaked into the slice, that `/me` renders only the placeholder, and verify the built pages still contain `[[ ]]` placeholders

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS US1a
- **US1a (Phase 3)**: Depends on Foundational
- **Polish (Phase 4)**: Depends on US1a

### Within the Slice

- Store files (T005–T010) before generation (T011); generated code before the adapter (T019)
- Tests (T015–T018, T032–T033) are written and observed failing before their implementations
- `packages/cms/cms.go` is a shared file: T029 before T036 and T036b; `packages/cms/internal/account/account.go` is shared: T022 before T034
- `packages/cms/src/pages/index.astro` (T037) is independent of the Go handlers once the page struct is fixed

### Parallel Opportunities

- Setup: T002–T004
- Foundational schemas/queries (T005–T010), OKF docs (T012–T013), and the four test files (T015–T018) are parallel
- Foundational implementations T020/T021 are different files; T019 (adapter) is independent of them
- UI primitives T026–T028 are parallel
- US1a tests T032–T033 are parallel; UI T037 is parallel with the handlers

---

## Parallel Example: Foundational

```bash
Task: "Write packages/store/schema/users.schema.sql"
Task: "Write packages/store/schema/sessions.schema.sql"
Task: "Write packages/store/schema/login-attempts.schema.sql"
Task: "Write tests in packages/cms/internal/authstore/authstore_test.go"
Task: "Write tests in packages/cms/internal/account/hash_test.go"
Task: "Write tests in packages/cms/internal/status/status_test.go"
```

## Parallel Example: User Story 1a

```bash
Task: "Write failing service tests in packages/cms/internal/account/authenticate_test.go"
Task: "Write failing handler tests in packages/cms/internal/router/index_test.go"
Task: "Build packages/cms/src/pages/index.astro"
```

---

## Implementation Strategy

### MVP (this slice)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (index-slice subset)
3. Complete Phase 3: US1a
4. **STOP and VALIDATE**: homepage renders with sample status; sign-in works against a seeded user; errors, throttling, and origin checks behave
5. Demo the index slice

### Deferred story slices (not generated)

- **Registration** (username availability, account creation, avatar choice) — clarify and generate later
- **Personal page** (signed-in layout content, avatar, motto editor, client entry, sign-out UI and `POST /logout` handler, admin link) — clarify and generate later; the minimal `/me` placeholder ships with this slice (T036b)
- **Recovery** (`/forgot`, reset, mail) — clarify and generate later
- `packages/store` recovery-tokens family and `packages/cms/internal/mail` are intentionally absent from this slice

---

## Notes

- [P] tasks touch different files and can run in parallel
- [Story] labels map tasks to spec user stories for traceability
- Tests come first and must fail before implementation (constitution IV)
- Commit after each task or logical group (only when the user asks)
- Skills that govern the work: `applying-go-patterns`, `templating-astro-pages`, `building-astro-components`, `adding-data-persistence`, `documenting-with-okf`, `use-modern-go`
