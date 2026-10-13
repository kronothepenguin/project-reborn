# Implementation Plan: Design System

**Branch**: `017-design-system` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-design-system/spec.md`. Implementation directives: the design system is its own pnpm package (`packages/components`, `@project-reborn/components`) with Svelte 5, Storybook, and Tailwind 4; components are functional and unstyled in the first slice, variants are added later; consumers include the package source in their Tailwind build so utility classes compile; Storybook is the catalogue; behaviour uses modern web APIs.

## Summary

Deliver the project's design system as a reusable Svelte 5 package in `packages/components`. The first slice (this branch) ships the twelve baseline components as fully functional, unstyled Svelte components with accessible behaviour built on modern web APIs — native `<dialog>` for Dialog, the Popover API for Menu, and the WAI-ARIA tabs pattern (roving tabindex) for Tabs/Tab/Tab panel — plus a Storybook catalogue that renders every component and every state, and Vitest component tests that prove the behaviour. Variants (visual only) and the flat/surface look & feel are a later slice; they change appearance, not behaviour.

Components ship as Svelte source through the package `exports` map, so a consuming Astro/Svelte app compiles them with its own Svelte toolchain and scans their utility classes by adding the package source to its Tailwind entry (`@source`). Storybook is the catalogue the spec's acceptance refers to: a story per component per state (FR-016, FR-017, SC-001, SC-005).

## Technical Context

**Language/Version**: TypeScript with Svelte 5 (runes); Node.js >= 22.12.0 (matches `packages/cms` engines)

**Primary Dependencies**: `svelte` (peer, provided by the consuming app), `tailwindcss` 4 with `@tailwindcss/vite`. Development tooling: Storybook with the Svelte + Vite framework, `vite`, `vitest` in browser mode (`@vitest/browser` + Playwright), `@testing-library/svelte`.

**Storage**: N/A — the package has no persistence.

**Testing**: `pnpm --filter @project-reborn/components test` (Vitest in browser mode with `@testing-library/svelte`) covering each component's states and interactions (Dialog open/close, Menu open/select/dismiss, Tabs selection, Form field error, keyboard focus). The Storybook catalogue is the manual acceptance surface, verified with `pnpm --filter @project-reborn/components build-storybook`.

**Target Platform**: modern evergreen browsers (the game client and CMS already require them); components are consumed by Astro/Svelte applications.

**Project Type**: library — a pnpm workspace package under `packages/` (no app entrypoint, no HTTP server, no Go).

**Performance Goals**: none specific; components are lightweight markup plus minimal runes state with no measurable latency target in the spec.

**Constraints**: Svelte 5 runes and snippets only; behaviour via modern web APIs (native `<dialog>`, Popover API, native form elements) rather than custom overlay/focus-trap code; components that map to a single HTML element extend its Svelte attribute type and forward the remaining attributes to it, and text renders in `<span>`; Form field is a generic label wrapper that takes its control as children (no caller-supplied id); no visual styling, variants, or look & feel in this slice (contrast and the look & feel belong to the later look/variants slice); consumers must register the package source in their Tailwind entry so utility classes compile; package scope is `@project-reborn/components` and the manager is `pnpm`.

**Scale/Scope**: 12 baseline components (Button, Link, Card, Paper, Input, Form field, Menu, Menu item, Tabs, Tab, Tab panel, Dialog), 1 package, 1 Storybook, 1 Vitest suite; Slice 1 delivers all 12 functioning and catalogued, with 0 variants and 0 look & feel.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Verdict | Evidence |
|---|---|---|
| I. Defined Before Built (NON-NEGOTIABLE) | PASS | Every component, its public API, and its states are fixed by spec.md and `contracts/` before implementation; Svelte/Tailwind/Storybook choices come from the user's implementation directives and `research.md`. |
| II. No Silent Interpretation (NON-NEGOTIABLE) | PASS | Open decisions — package location/name, Svelte 5, Tailwind sharing, Storybook as catalogue, modern web APIs, component API shape (HTML attribute extension, generic Form field), unstyled first slice, deferred variants/look & feel — are recorded in `research.md` with rationale; none silently guessed. |
| III. Specification-Driven Development (NON-NEGOTIABLE) | PASS | Artifacts live under `specs/017-design-system/`; delivery slices map to the spec's user stories; the spec stays implementation-free while this plan owns the how. |
| IV. Test & Verification Discipline | PASS | Vitest component tests ship with Slice 1, written before the behaviour; gates are `pnpm --filter @project-reborn/components test` and a clean `build-storybook`. |
| V. KISS | PASS | Components ship as source (no build step); native browser primitives carry the behaviour; one context helper per compound component rather than a generic plumbing layer. |
| VI. YAGNI | PASS (note) | All twelve baseline components ship in Slice 1 because the user directed "all the base components" for the first slice; variants and the look & feel are explicitly deferred. Recorded in Complexity Tracking. |
| VII. SOLID | PASS | One component per file with one responsibility; compound behaviour is exposed through a single narrow context per family (Tabs, Menu) so children depend only on what they use. |

**Post-design re-check (Phase 1)**: PASS — the data model and contracts add no dependency or abstraction beyond those listed above; the `building-astro-components` and `adding-svelte-interactivity` conventions (kebab-case files, Svelte 5 runes, `client:only` at the consumer boundary) are respected, and the pnpm workspace/scope rules from the constitution are met.

## Delivery Slices

| Slice | Scope | Status |
|---|---|---|
| 1 | Functional, unstyled baseline components + Storybook catalogue + Vitest behaviour tests | this branch |
| 2 | Look & feel (flat/surface) and variants + visual acceptance (contrast) | spec/plan updated when the slice starts |

Each slice is independently deliverable: Slice 1 gives working, catalogued components that a page can already use; Slice 2 adds appearance without changing behaviour.

**Requirement coverage**: Slice 1 satisfies FR-001–FR-012 (states; FR-003's variant clause is Slice 2), FR-016 (states), FR-017–FR-021. Slice 2 adds the look & feel and variants (FR-003 variant clause, FR-013–FR-015, FR-022) and variant colours in the catalogue (FR-016).

## Project Structure

### Documentation (this feature)

```text
specs/017-design-system/
├── spec.md              # feature specification
├── plan.md              # this file
├── research.md          # Phase 0 output — resolved decisions
├── data-model.md        # Phase 1 output — component/state/catalogue model
├── quickstart.md        # Phase 1 output — run/build/validate guide
├── contracts/
│   ├── components.md    # public API (props, snippets, callbacks, context) of every component
│   └── package.md       # package name, exports, peer deps, Tailwind/consumption contract
├── checklists/
│   └── requirements.md  # specification quality checklist
└── tasks.md             # generated by /speckit.tasks from this plan
```

### Source Code (repository root)

```text
packages/components/
├── package.json                     # @project-reborn/components; exports Svelte source
├── tsconfig.json                    # Svelte + TS strict, matches packages/cms style
├── vite.config.ts                   # Vitest browser-mode config (svelte plugin)
├── README.md                        # install + Tailwind @source instructions
├── .storybook/
│   ├── main.ts                      # @storybook/svelte-vite framework
│   └── preview.ts                   # imports src/styles.css
└── src/
    ├── index.ts                     # public exports of every component + types
    ├── styles.css                   # `@import "tailwindcss"; @source "./";` (Storybook/tests)
    ├── context.ts                   # typed context keys/helpers for Tabs and Menu families
    ├── components/
    │   ├── button.svelte
    │   ├── button.stories.ts
    │   ├── button.test.ts
    │   ├── link.svelte
    │   ├── paper.svelte
    │   ├── card.svelte
    │   ├── input.svelte
    │   ├── form-field.svelte
    │   ├── menu.svelte
    │   ├── menu-item.svelte
    │   ├── tabs.svelte
    │   ├── tab.svelte
    │   ├── tab-panel.svelte
    │   └── dialog.svelte        # + .stories.ts / .test.ts per component
    └── stories/
        └── catalogue.mdx            # the catalogue overview page
```

**Structure Decision**: The design system is a library package (`packages/components`), not an app, so it has no Go entrypoint and no port; Storybook is its dev server and its catalogue, and Vitest is its test runner. Components are authored in kebab-case Svelte files under `src/components/`, exported through `src/index.ts`, and consumed as source by Astro/Svelte apps that add the package to their Tailwind `@source` list. This follows the workspace rule (packages own implementation; apps own processes) and the `@project-reborn` scope.

## Complexity Tracking

| Addition | Why it is needed | Simpler alternative rejected because |
|---|---|---|
| All twelve components in Slice 1 | The user directed "all the base components" for the first slice; the components are the spec's baseline and must exist before variants and the look & feel can be defined. | Shipping one component at a time would leave the catalogue incomplete and contradict the first-slice directive. |
| A typed context per compound family (Tabs, Menu) | Tabs and Menu need parent/child coordination (selection, open state) that is defined by the spec (FR-009, FR-010, FR-011) and cannot be expressed through props alone. | Passing callbacks through every child prop would couple pages to internal wiring and is harder to keep accessible. |
