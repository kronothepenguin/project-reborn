<!--
  SYNC IMPACT REPORT
  Version change: v1.0.0 -> v2.0.0 (MAJOR - project redefinition: v1 was
    ratified before the user's actual intent was captured; principles and
    constraints replaced per user review)
  Modified principles:
    I. Fidelity Over Invention -> I. Defined Before Built
    V. Architecture Boundaries & Conventions -> removed (folded into
       Additional Constraints + Development Workflow)
    Remaining v1 principles (Spec-Driven, Test, KISS/YAGNI) reworded and
    split: KISS and YAGNI are now separate principles (V, VI)
  Added principles:
    II. No Silent Interpretation
    VII. SOLID
  Added sections: preamble (project summary without app names),
    Additional Constraints (packages vs apps, go workspace, go tooling,
    JS/pnpm, security), Development Workflow (dev/build modes)
  Removed sections: v1-specific Director/client fidelity wording
    (no-fabrication folded into I), Godot client mentions, static app
    layout details
  Templates: plan-template.md, spec-template.md, tasks-template.md,
    checklist-template.md - verified aligned (constitution references
    are generic); NO template changes required
  Commands: .opencode/commands/speckit.*.md reference the constitution
    generically; no outdated agent-specific names found (verified)
  Runtime guidance: AGENTS.md and README.md currently describe the old
    layout (Godot standby client, apps-first structure) - MANUAL
    FOLLOW-UP required to match v2.0.0
  Follow-up TODOs:
    - specs/001-director-runtime/plan.md + tasks.md state the
      constitution was an unfilled template (vacuous Constitution
      Check); MUST be re-evaluated against v2.0.0
    - RATIFICATION_DATE set to 2026-08-29 (second ratification). If the
      project adopts an earlier ratification date, correct the version
      line and this report.
-->

# Project Reborn Constitution

Project Reborn is a monorepo that remakes Habbo Hotel from the 2008
Shockwave (Macromedia Director) era in JavaScript and Go. The project is
organized as packages and app entrypoints: packages export the
implementation skeleton, and apps are thin runners that import a package
and execute it. An orchestrator can run each app on its own port or all
of them composed on one HTTP server.

## Core Principles

### I. Defined Before Built (NON-NEGOTIABLE)

Everything MUST be defined before it is built. The agent MUST never
hallucinate, invent, or take a decision that was not previously defined
by a spec.

- When building, the agent MUST rely only on accepted skills and spec
  plans.
- If something needed is not defined in the skills or specs, the agent
  MUST assert the gap and either update the doc/spec or create a new
  skill - before building.

### II. No Silent Interpretation (NON-NEGOTIABLE)

When any source is unclear, ambiguous, contradictory, or silent, the
agent MUST stop, surface the ambiguity, and plan the resolution together
with the user before implementing. No silent guesses, no "best effort".

### III. Specification-Driven Development (NON-NEGOTIABLE)

Every feature flows through the speckit pipeline - specify -> plan ->
tasks -> implement - with artifacts under `specs/<NNN-feature>/`.

- The plan's Constitution Check gate MUST pass before Phase 0 research
  and be re-checked after Phase 1 design and after every amendment.
- Requirements map to priority user stories (P1 > P2 > P3), each
  independently implementable, testable, and deliverable as an MVP
  increment.
- Refactors MUST document the spec-violating patterns they remove and
  the target state.
- Complexity beyond the minimal structure MUST be justified in the
  plan's Complexity Tracking table.

### IV. Test & Verification Discipline

- When a spec requests tests, write them first, observe them FAIL, then
  implement (red-green).
- Refactors MUST NOT orphan or delete tests; tests asserting removed
  behavior are rewritten in the same pass.
- Gates: `go vet` + `go test ./...` per affected module; vitest via
  `pnpm --filter @project-reborn/<name> test`; regenerated code is
  kept in sync with its source.

### V. KISS (Keep It Simple, Stupid)

Simplicity MUST be the design goal; unnecessary complexity MUST be
avoided. Systems work best when kept simple rather than made
complicated.

- The simplest solution that satisfies the spec is the default and
  needs no justification; any added complexity does.
- Prefer the obvious, boring solution over the clever one. If a
  solution cannot be explained in one sentence, it is too complex.
- Make everything as simple as possible, but not simpler: strip what is
  not needed, never strip what the spec requires.
- Code that is hard to understand is a defect, not a badge.

### VI. YAGNI (You Aren't Gonna Need It)

Implement things when you actually need them, never when you merely
foresee needing them (Extreme Programming, Ron Jeffries).

- Work the story that exists in the spec, not the story you think is
  coming. Foreseen needs are notes in the spec/plan, never code.
- No speculative abstractions: no generic plumbing, factory layers,
  wrapper services, or extension points built "just in case".
- Defer features and design decisions until a spec requirement demands
  them. Add the layer when the need is real, then it is already
  justified.
- Combined with Principle III: if the spec does not ask for it, it is
  not built; if the spec asks for it, it is built without extra layers.

### VII. SOLID

SOLID object-oriented design MUST be applied to every Go and JavaScript
class, package, and module:

- **S - Single Responsibility**: one class, one package, one module,
  one reason to change.
- **O - Open/Closed**: open for extension. New behavior MUST extend
  existing tested code; changes to existing tested behavior MUST flow
  through the spec pipeline (III) with deliberate test updates - never
  silent rewrites.
- **L - Liskov Substitution**: a subtype MUST be substitutable for its
  base type without breaking the contract.
- **I - Interface Segregation**: client code depends only on the
  interfaces it actually uses; no fat, multi-purpose interfaces.
- **D - Dependency Inversion**: depend on abstractions, not
  concretions; high-level policy MUST NOT depend on low-level details.

Reconciliation: YAGNI (VI) governs whether an abstraction exists at all;
SOLID governs how the dependencies that DO exist are structured. No
abstraction layer may be created "to be SOLID".

## Additional Constraints

- **Packages vs. apps**: packages own implementation - models, logic,
  handlers. Apps own executables - the process, port, entrypoint. For
  an HTTP app the package exposes `Mount`/`Routes` against an
  `http.ServeMux`; the app creates the `http.Server`. The app calls the
  package's `Mount`/`Routes` over the mux.
- **Go workspaces**: the repo is a single Go workspace (`go.work`
  committed) with no root module; every app and package is its own
  module.
- **Go tooling**: dev tools (`air`, `sqlc`, ...) are declared as `tool`
  directives in the relevant `go.mod`; no global tool installs.
- **JS**: all JS lives in the pnpm workspace with the
  `@project-reborn/<name>` scope; use `pnpm`, never `npm` or `yarn`.
- **Security**: never log or commit secrets; keys stay out of the
  repository.

## Development Workflow

Two modes: **dev** and **build**.

- **dev** - one command per app, `/packages/<app>/cmd/dev`: it starts
  the Go HTTP server and the Astro dev server; the Go server
  reverse-proxies HTML and scripts from the Astro dev server.
- **build** - `Astro build -> embed -> Go build`: build the Astro
  output, embed the `dist` output into the Go binary, then build Go.
  Every web-touching app has a Go file that embeds its Astro output.
- Commits are conventional-style (`feat:`/`fix:`/`docs:`/`chore:`),
  small and single-purpose, made after each task or logical group.
- `AGENTS.md` provides runtime guidance; the constitution prevails on
  conflict.

## Governance

The constitution supersedes all other practices and templates in case
of conflict.

- Amendment procedure: propose the change, assign a bump type, update
  `.specify/memory/constitution.md`, set `Last Amended` to today,
  propagate to dependent artifacts, prepend a Sync Impact Report.
  Amendments are expected and welcome at any time.
- Versioning (semver): MAJOR = backward-incompatible principle
  removals/redefinitions; MINOR = new principle/section or materially
  expanded guidance; PATCH = clarifications/wording.
- Compliance: the plan.md Constitution Check gate is mandatory and
  re-run on every amendment; constitution violations are CRITICAL in
  `/speckit.analyze` and `/speckit.converge`.
- An unfilled (template) constitution enforces no gates; a ratified one
  does. PRs and implementations must verify this file reflects current
  principles.

**Version**: 2.0.0 | **Ratified**: 2026-08-29 | **Last Amended**: 2026-08-29