# Tasks: 012 — HTTP Session-Based Authentication Library

**Input**: Design documents from `/specs/012-session-auth/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/library-api.md, contracts/store.md, quickstart.md

**Tests**: Included — the plan and constitution (Principle IV) require tests first per user story; the gate is `cd packages/auth && go vet ./... && go test ./...`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Library (single Go package)**: all source and tests live in `packages/auth/`
- Module: `github.com/kronothepenguin/project-reborn/packages/auth` (already in `go.work`; stdlib only)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the pre-existing empty module is a clean baseline before anything is written.

- [X] T001 Verify `packages/auth` is listed in `go.work`, `packages/auth/go.mod` declares no third-party requirements, `packages/auth/auth.go` is only `package auth`, and the baseline gate passes with `go vet ./...` + `go test ./...` in `packages/auth`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Errors, configuration, data types, crypto primitives, persistence contracts, test doubles, and event plumbing that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Define exported error sentinels `ErrNoSession`, `ErrExpired`, `ErrRevoked`, `ErrCSRF`, `ErrConfig`, `ErrNotFound` with `%w`-matchable semantics in `packages/auth/auth.go` (D18)
- [X] T003 [P] Write foundational tests — error sentinel matching via `errors.Is`; option defaults and validation (`__Host-` rules, positive timeouts, `TokenBytes >= 16`, `TouchInterval <= IdleTimeout` → `ErrConfig`); credential entropy ≥128 bits, uniqueness, and digest format; CSRF derivation; event redaction — in `packages/auth/foundation_test.go`, observed FAIL before T004–T009 (FR-004, FR-006, FR-013, FR-016, D7, D8, D18, constitution IV)
- [X] T004 Implement unexported `settings`, all 17 `Option` setters (16 plan options plus `WithRemember`; amendment 2026-09-11) with secure defaults, and `resolve(...)`/`validate()` (cookie `__Host-` rules, positive timeouts, `TokenBytes >= 16`, `TouchInterval <= IdleTimeout` → `ErrConfig`) in `packages/auth/auth.go` (FR-016, D2, D17)
- [X] T005 [P] Define `AccountID = int64`, `Session` (all persisted fields), and `Auth` (`Session`, `CSRF`, unexported credential) with redacting `String()`/`LogValue()` in `packages/auth/session.go` (FR-006, D15, data-model.md)
- [X] T006 Implement credential generation via `crypto/rand.Read` (`WithTokenBytes`, hard minimum 16), `base64.RawURLEncoding` encoding, SHA-256 digest for `Session.ID`, and the derived HMAC-SHA256 synchronizer token in `packages/auth/session.go` (FR-004, FR-006, D7, D8)
- [X] T007 Define the seven single-method role interfaces `Creator`, `Validator`, `Toucher`, `Revoker`, `AccountRevoker`, `Lister`, `Purger` with doc comments matching `contracts/store.md` in `packages/auth/store.go` (D4, FR-017)
- [X] T008 Implement in-test memory doubles for all seven roles, each behaviorally matching `contracts/store.md` (insert-only `Creator`, `ErrNotFound`-for-revoked `Validator`, activity-only `Toucher`, idempotent `Revoker`, atomic `AccountRevoker` returning revoked records, active-only `Lister`, deadline-aware `Purger`) plus failing-double seams in `packages/auth/memory_test.go` (R4, R9)
- [X] T009 [P] Implement `Event`, `EventKind` (`created`/`rotated`/`revoked`/`logged_out`/`expired`), `Outcome` (`ok`/`denied`), `EventSink`, and the default redacting `log/slog.Default()` sink in `packages/auth/events.go` (FR-013, D12)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — A verified person logs in and stays recognized until they log out (Priority: P1) 🎯 MVP

**Goal**: `Create` establishes a session after the app verified credentials; `Protect`/`Validate` recognize the account on every request; missing/expired/revoked sessions are denied; `Logout` revokes and clears.

**Independent Test**: Wire an `httptest` application with login, protected, and logout handlers; exercise the flow and assert identity resolution and denial (quickstart Scenario 1).

### Tests for User Story 1 (write first, observe FAIL) ⚠️

- [X] T010 [P] [US1] Write US1 acceptance tests — login establishes identity, later protected request recognized via `Protect`/`FromContext`, no session denied, revoked/expired session denied, logout clears cookie and rejects replay — in `packages/auth/us1_test.go` (FR-001, FR-007, FR-010, FR-019)

### Implementation for User Story 1

- [X] T011 [P] [US1] Implement hardened cookie set/clear (`__Host-session`, `Path=/`, no `Domain`, `HttpOnly`, `Secure` via `WithCookieSecure` default true, `SameSite=Strict`, `Max-Age` only for remember; no transport check) plus the `maxCookieLength = 128` bytes limit in `packages/auth/cookie.go` (FR-005, D9, D13, D14)
- [X] T012 [US1] Implement `Create` in `packages/auth/lifecycle.go` — revoke presented digest then create fresh record (never adopt client value), set cookie (persistent + remember deadline when `WithRemember(true)`), record `created` (FR-001, FR-002, D11)
- [X] T013 [US1] Implement `Validate` in `packages/auth/lifecycle.go` — parse cookie (reject absent/malformed/over-`maxCookieLength`/multiple), digest lookup, revoked/expired denial with `expired` event, throttled `Touch`, return `*Auth` (FR-007, FR-008, FR-019, D10)
- [X] T014 [US1] Implement `Protect`, `NewContext`, and `FromContext` in `packages/auth/middleware.go` — resolve options once, `Validate` → context → `next`, `WithUnauthorizedHandler` on denial (FR-007, FR-019, D3); CSRF wiring is added in US4
- [X] T015 [US1] Implement `Logout` in `packages/auth/lifecycle.go` — revoke presented digest, always clear the cookie, idempotent, record `logged_out` (FR-010)

**Checkpoint**: US1 fully functional and testable independently (MVP)

---

## Phase 4: User Story 2 — Sessions cannot be forged, fixated, or hijacked (Priority: P1)

**Goal**: Credentials are high-entropy and unique, stored only as digests, never adopted from the client, delivered in hardened cookies, bounded by idle/absolute timeouts, and rotated on privilege changes.

**Independent Test**: Automated security assertions over the library, in-memory store, `Set-Cookie` attributes, and clock-driven timeouts (quickstart Scenario 2).

### Tests for User Story 2 (write first, observe FAIL) ⚠️

- [X] T016 [P] [US2] Write US2 security tests — ≥128-bit entropy and uniqueness sampling; store snapshot contains digests only; fixation (presented credential revoked, never adopted, replacement credential differs); cookie attributes (`__Host-`, `HttpOnly`, `Secure` default, `SameSite=Strict`, `Path=/`, no `Domain`); `WithCookieSecure(false)` (paired with a non-`__Host-` cookie name, e.g. `WithCookieName("session")`) dropping only the `Secure` attribute; plain HTTP requests authenticated normally (no transport check, spec C3); remember-me sessions get a persistent cookie (`Max-Age`/`Expires` = remember timeout, 30-day absolute deadline) while the default cookie is browser-session; idle expiry and non-extendable absolute deadline via `WithClock`; replay rejection after `Rotate`/revocation/logout — in `packages/auth/us2_test.go` (FR-002, FR-004, FR-005, FR-006, FR-008, FR-009, SC-002, SC-003, SC-004)
- [X] T017 [P] [US2] Write configuration tests — invalid cookie name, `__Host-` rule violations, non-positive timeouts, `TokenBytes < 16`, `TouchInterval > IdleTimeout` return `ErrConfig`, and `Protect` panics at construction time on invalid options — in `packages/auth/options_test.go` (FR-016, D3, D17)

### Implementation for User Story 2

- [X] T018 [US2] Implement `Rotate` in `packages/auth/lifecycle.go` — preserve `AccountID`, `CreatedAt`, `AbsoluteExpiresAt`, `Remember` from the validated `*Auth`, revoke old digest before creating the new record, set new cookie, record `rotated` (FR-009, D11)

**Checkpoint**: US2 security contract verified independently

---

## Phase 5: User Story 3 — Compromised sessions can be contained and audited (Priority: P2)

**Goal**: List and revoke an account's sessions, invalidate all other sessions on password change, and record secretless lifecycle audit events.

**Independent Test**: Create several sessions, list and revoke them, run `PasswordChanged`, and inspect captured `EventSink` records (quickstart Scenario 3).

### Tests for User Story 3 (write first, observe FAIL) ⚠️

- [X] T019 [P] [US3] Write US3 tests — `List` returns creation/last-activity/origin metadata and filters past-deadline records by the configured clock; `Revoke`/`RevokeAll` cause immediate rejection; `PasswordChanged` invalidates every other session, keeps the acting session valid with a rotated credential; captured events cover each lifecycle action with timestamp, account, digest, outcome, origin, and contain no credential/password text — in `packages/auth/us3_test.go` (FR-011, FR-013, FR-014)

### Implementation for User Story 3

- [X] T020 [US3] Implement `Revoke` and `RevokeAll` in `packages/auth/lifecycle.go`, emitting one `revoked` event per revoked record (FR-013, FR-014)
- [X] T021 [US3] Implement `List` in `packages/auth/lifecycle.go`, returning active sessions filtered against the configured clock (FR-014)
- [X] T022 [US3] Implement `PasswordChanged` in `packages/auth/lifecycle.go` — `AccountRevoker` with the acting session as survivor emitting one `revoked` event per returned record, then rotate the acting session (FR-011, D11)

**Checkpoint**: Sessions can be listed, individually or bulk revoked, and audited

---

## Phase 6: User Story 4 — State-changing requests cannot be forged from another site (Priority: P2)

**Goal**: Authenticated unsafe requests are accepted only with the derived per-session synchronizer token.

**Independent Test**: Send valid, missing, forged, and wrong-session tokens; assert acceptance/rejection, no token in cookies, and rotation of the token (quickstart Scenario 4).

### Tests for User Story 4 (write first, observe FAIL) ⚠️

- [X] T023 [P] [US4] Write US4 tests — correct header token and correct form-field token accepted; missing/forged/wrong-session token rejected with `ErrCSRF`/403 and handler not invoked; safe methods are a no-op; `a.CSRF` appears in no `Set-Cookie` and differs after `Rotate` — in `packages/auth/us4_test.go` (FR-012, SC-002, SC-003)

### Implementation for User Story 4

- [X] T024 [US4] Implement `CheckCSRF` in `packages/auth/middleware.go` — no-op for safe methods, read `WithCSRFHeader` then `WithCSRFParam` (parsing the form), constant-time compare against `a.CSRF`, return `ErrCSRF` (FR-012, D7)
- [X] T025 [US4] Wire `CheckCSRF` into `Protect` for `POST`/`PUT`/`PATCH`/`DELETE` using `WithForbiddenHandler` (default generic 403), keeping US1 tests green (safe-method accesses or tokens) in `packages/auth/middleware.go` (FR-012, D3)

**Checkpoint**: Unsafe requests require same-origin proof; US1/US2 tests remain green

---

## Phase 7: User Story 5 — Sessions survive restarts and scale across instances (Priority: P3)

**Goal**: Sessions persist across process restarts, are honored consistently by every instance sharing the store, and expired/revoked records do not accumulate.

**Independent Test**: Share one store across two `Protect` closures and across a fresh middleware reconstruction; run `Purge` and assert only revoked/expired records are removed (quickstart Scenario 5).

### Tests for User Story 5 (write first, observe FAIL) ⚠️

- [X] T026 [P] [US5] Write US5 tests — a session created through one call site is accepted and revocable through a second independent call site over the same store; middleware/options rebuilt from scratch over the same store recognize live sessions (restart); `Purge` removes revoked and past-deadline records only, leaves active ones, and returns the removed count — in `packages/auth/us5_test.go` (FR-017, FR-018, SC-005)

### Implementation for User Story 5

- [X] T027 [US5] Implement `Purge` in `packages/auth/lifecycle.go` using the configured clock (FR-018)

**Checkpoint**: All user stories are independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, performance proof, edge-case hardening, and final validation

- [X] T028 [P] Add package documentation and a usage example aligned with quickstart in `packages/auth/doc.go`
- [X] T029 [P] Add the SC-006 benchmark/timing assertion — over the in-memory store with N ≥ 10,000 samples, the 95th percentile added latency is < 10 ms (compute p95 from measured samples; the mean alone is insufficient) — in `packages/auth/bench_test.go` (SC-006)
- [X] T030 [P] Add cross-cutting fail-closed/edge-case tests — multiple/malformed/over-`maxCookieLength` cookies denied generically, each failing role double denies access, session creation for an unresolvable account fails closed with no partial session stored (`Creator` error path), no address/user-agent binding, concurrent access during rotation yields at most one valid credential — in `packages/auth/edgecases_test.go` (FR-019, spec edge cases)
- [X] T031 Validate quickstart scenarios end-to-end — the login/protected/logout test app is wired only through the exported functions with no route/page/layout assumptions, and `go list -deps` confirms stdlib-only imports (FR-015, SC-001) — and run the full gate `cd packages/auth && go vet ./... && go test ./...` green (constitution IV)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phases 3–7)**: All depend on Foundational
  - US1 (P1) and US2 (P1) first; US3/US4 (P2) next; US5 (P3) last
  - US2, US3, US4, US5 reuse the types and primitives built in Phase 2
- **Polish (Phase 8)**: Depends on all targeted user stories
- Every phase checkpoint requires the gate `go vet ./... && go test ./...` in `packages/auth` to be green before starting the next phase (constitution IV)

### User Story Dependencies

- **US1 (P1)**: After Foundational — no dependency on other stories; delivers the MVP
- **US2 (P1)**: After Foundational — asserts properties of US1 primitives and adds `Rotate`; independently testable
- **US3 (P2)**: After Foundational — adds admin/revocation/audit; independent of US2
- **US4 (P2)**: After Foundational — adds `CheckCSRF` and modifies `Protect`; independent of US2/US3
- **US5 (P3)**: After Foundational — adds `Purge`; independent

### Within Each User Story

- Write the story's tests first and observe them fail (constitution IV)
- Models/primitives before services; services before middleware wiring
- Same-file tasks are sequential (`lifecycle.go` and `middleware.go` edits never run concurrently)

### Parallel Opportunities

- Phase 2: T003 precedes T004–T009 (written and observed failing first); T005 and T009 can run parallel with T002/T004; T007/T008 follow T005
- Once Foundational completes, US1–US5 can be staffed in parallel (same-file edits within `lifecycle.go`/`middleware.go` must serialize)
- Test tasks T010, T016, T017, T019, T023, T026 (separate `_test.go` files) can all be written in parallel
- Polish T028–T030 are separate files

---

## Parallel Example: User Story 1

```bash
# Tests first (separate file):
Task: "Write US1 acceptance tests in packages/auth/us1_test.go"

# Parallel-safe infrastructure (different files):
Task: "Implement cookie set/clear and cookie hardening in packages/auth/cookie.go"

# Then sequential lifecycle/wiring tasks (T012–T015 share lifecycle.go/middleware.go):
Task: "Implement Create in packages/auth/lifecycle.go"
Task: "Implement Validate in packages/auth/lifecycle.go"
Task: "Implement Protect/NewContext/FromContext in packages/auth/middleware.go"
Task: "Implement Logout in packages/auth/lifecycle.go"
```

## Parallel Example: Security Stories

```bash
# Tests for independent stories can be authored together:
Task: "Write US2 security tests in packages/auth/us2_test.go"
Task: "Write US3 containment/audit tests in packages/auth/us3_test.go"
Task: "Write US4 CSRF tests in packages/auth/us4_test.go"
Task: "Write US5 restart/purge tests in packages/auth/us5_test.go"

# Implementations touching different concerns:
Task: "Implement Rotate in packages/auth/lifecycle.go"
Task: "Implement CheckCSRF in packages/auth/middleware.go"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T009) — CRITICAL
3. Complete Phase 3: US1 (T010–T015)
4. **STOP and VALIDATE**: run `go vet ./...` + `go test ./...`; US1 scenarios pass independently
5. The library is now a usable MVP for login/recognized/logout

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → independently tested → MVP
3. US2 → security assertions green → harden
4. US3 → administration + audit
5. US4 → CSRF on unsafe requests
6. US5 → restart/multi-instance + cleanup
7. Polish → docs, SC-006 benchmark, edge cases, final gate
8. Each story adds value without breaking previous stories; gate stays green after every phase

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (MVP path)
   - Developer B: US2 (after US1 primitives land)
   - Developer C: US3
   - Developer D: US4
   - Developer E: US5
3. Serialize edits to `lifecycle.go`/`middleware.go`; stories integrate independently

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps every story-phase task to spec.md user stories for traceability
- Tests are written first and observed failing before implementation (constitution IV)
- No third-party modules may enter `packages/auth/go.mod` (stdlib only)
- Raw credentials never persisted, logged, or placed in events (FR-006, FR-013, SC-004)
- Commit after each task or logical group; stop at any checkpoint to validate a story independently
