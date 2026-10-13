---

description: "Task list for the Design System (Slice 1)"
---

# Tasks: Design System

**Input**: Design documents from `/specs/017-design-system/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included because the approved plan defines `pnpm --filter @project-reborn/components test` (Vitest browser mode) as a Slice 1 gate and constitution IV mandates test discipline. Write each test first and watch it fail before implementing.

**Scope**: This branch is **Slice 1** — all twelve baseline components, functional and unstyled, with the Storybook catalogue and behaviour tests. Variants, the look & feel (flat/surface), and visual acceptance (**User Story 3**) are deferred to Slice 2 (see "Deferred").

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Every task includes an exact file path

## Path Conventions

- Package root: `packages/components/`
- Components, tests, and stories: `packages/components/src/components/`
- Paths are project-relative.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the `@project-reborn/components` package and its tooling entry points.

- [ ] T001 Create `packages/components/package.json`: name `@project-reborn/components`, `type: module`, `private: true`, `engines.node >=22.12.0`, `exports` mapping `.` → `./src/index.ts` and `./styles.css` → `./src/styles.css`, `peerDependencies.svelte` `^5`, and scripts `dev`/`storybook`, `build-storybook`, `test`, `check` (per `contracts/package.md`)
- [ ] T002 [P] Add `packages/components/tsconfig.json` extending the Svelte/TS strict settings used by `packages/cms`
- [ ] T003 [P] Add `packages/components/src/styles.css` containing `@import "tailwindcss";` and `@source "./";` (used by Storybook and tests only)
- [ ] T004 [P] Create the export barrel `packages/components/src/index.ts` (re-export placeholder to be filled by T036)
- [ ] T005 [P] Write `packages/components/README.md` with the install steps and the Tailwind `@source "../../packages/components/src";` consumption instruction from `contracts/package.md`
- [ ] T006 Install the package devDependencies with `pnpm --filter @project-reborn/components add -D` (Storybook + `@storybook/svelte-vite`, `vite`, `vitest`, `@vitest/browser`, `playwright`, `@testing-library/svelte`, `tailwindcss`, `@tailwindcss/vite`, `svelte-check`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Toolchain that every component and story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T007 Configure Storybook framework in `packages/components/.storybook/main.ts` (`@storybook/svelte-vite`, stories glob `../src/**/*.stories.ts` and `../src/**/*.mdx`)
- [ ] T008 [P] Configure Storybook preview in `packages/components/.storybook/preview.ts` importing `../src/styles.css`
- [ ] T009 [P] Configure Vitest browser mode in `packages/components/vite.config.ts` (svelte plugin + `@vitest/browser` provider, include `src/**/*.test.ts`)
- [ ] T010 Run the empty gates (`pnpm --filter @project-reborn/components test` and `pnpm --filter @project-reborn/components build-storybook`) to confirm the toolchain runs before components exist

**Checkpoint**: Package, Storybook, and the browser test runner all run.

---

## Phase 3: User Story 1 - Build UI from a shared component set (Priority: P1) 🎯 MVP

**Goal**: All twelve baseline components exist as functional, unstyled Svelte 5 components with accessible behaviour built on modern web APIs.

**Independent Test**: Assemble a representative page in Storybook (or a scratch route) using only these components and confirm each renders and behaves per `data-model.md` (Dialog opens modally, Menu popover opens/selects/dismisses, Tabs swap panels, Form field shows error), with no page-specific UI code.

### Tests for User Story 1 ⚠️

> Write these first and ensure they FAIL before implementing the matching component.

- [ ] T011 [P] [US1] Write Button tests (attribute forwarding, `type` default, disabled) in `packages/components/src/components/button.test.ts`
- [ ] T012 [P] [US1] Write Link tests (renders `<a>`, forwards attributes) in `packages/components/src/components/link.test.ts`
- [ ] T013 [P] [US1] Write Paper tests (renders surface container, forwards attributes) in `packages/components/src/components/paper.test.ts`
- [ ] T014 [P] [US1] Write Card tests (composes Paper, renders header + body) in `packages/components/src/components/card.test.ts`
- [ ] T015 [P] [US1] Write Input tests (two-way value, forwards input attributes) in `packages/components/src/components/input.test.ts`
- [ ] T016 [P] [US1] Write Form field tests (label + child control association without id, help/error spans) in `packages/components/src/components/form-field.test.ts`
- [ ] T017 [P] [US1] Write Menu tests (popover opens, item select fires and closes, light dismiss) in `packages/components/src/components/menu.test.ts`
- [ ] T018 [P] [US1] Write Menu item tests (selected/disabled states, reports value) in `packages/components/src/components/menu-item.test.ts`
- [ ] T019 [P] [US1] Write Tabs tests (selection, keyboard Arrow/Home/End, roving tabindex) in `packages/components/src/components/tabs.test.ts`
- [ ] T020 [P] [US1] Write Tab tests (selected state, activation) in `packages/components/src/components/tab.test.ts`
- [ ] T021 [P] [US1] Write Tab panel tests (shown only when its Tab is selected) in `packages/components/src/components/tab-panel.test.ts`
- [ ] T022 [P] [US1] Write Dialog tests (modal open, Esc/backdrop close, centered content, page inert) in `packages/components/src/components/dialog.test.ts`

### Implementation for User Story 1

- [ ] T023 [P] [US1] Implement Button in `packages/components/src/components/button.svelte` (`interface Props extends HTMLButtonAttributes`, `type` default `"button"`, spread rest onto `<button>`, render children in a `<span>`)
- [ ] T024 [P] [US1] Implement Link in `packages/components/src/components/link.svelte` (`extends HTMLAnchorAttributes`, spread rest onto `<a>`, children in a `<span>`)
- [ ] T025 [P] [US1] Implement Paper in `packages/components/src/components/paper.svelte` (`extends HTMLAttributes<HTMLDivElement>`, plain surface container; Paper defines no elevation — that belongs to the look & feel in Slice 2)
- [ ] T026 [US1] Implement Card in `packages/components/src/components/card.svelte` (composes Paper; optional `header` snippet + body; `extends HTMLAttributes<HTMLDivElement>`)
- [ ] T027 [P] [US1] Implement Input in `packages/components/src/components/input.svelte` (`extends HTMLInputAttributes`, bindable `value`, spread rest onto `<input>`)
- [ ] T028 [US1] Implement Form field in `packages/components/src/components/form-field.svelte` (generic wrapper: `<label>` wrapping a label `<span>` and children; `help`/`error` spans; no caller id; `extends HTMLAttributes<HTMLLabelElement>`)
- [ ] T029 [US1] Implement compound context helpers in `packages/components/src/context.ts` (typed keys/accessors for the Tabs family selection and the Menu family open/select)
- [ ] T030 [US1] Implement Menu in `packages/components/src/components/menu.svelte` (trigger + Popover API list; provides Menu context; `onselect`; `extends HTMLAttributes<HTMLDivElement>`)
- [ ] T031 [US1] Implement Menu item in `packages/components/src/components/menu-item.svelte` (reads Menu context, selectable entry, selected/disabled; `extends HTMLButtonAttributes`)
- [ ] T032 [US1] Implement Tabs in `packages/components/src/components/tabs.svelte` (owns selected value, provides Tabs context, keyboard navigation; `extends HTMLAttributes<HTMLDivElement>`)
- [ ] T033 [US1] Implement Tab in `packages/components/src/components/tab.svelte` (reads Tabs context, selected state, activation; `extends HTMLButtonAttributes`)
- [ ] T034 [US1] Implement Tab panel in `packages/components/src/components/tab-panel.svelte` (reads Tabs context, shown only when selected; `extends HTMLAttributes<HTMLDivElement>`)
- [ ] T035 [US1] Implement Dialog in `packages/components/src/components/dialog.svelte` (native `<dialog>` via `showModal()`/`close()`, bindable `open`, `onclose`, centered content; `extends HTMLDialogAttributes`)
- [ ] T036 [US1] Export every component and public type from `packages/components/src/index.ts`

**Checkpoint**: User Story 1 is fully functional and testable on its own — `pnpm --filter @project-reborn/components test` passes.

---

## Phase 4: User Story 2 - Review every component and state in one catalogue (Priority: P2)

**Goal**: Storybook renders every baseline component in every documented state, each with a usage note.

**Independent Test**: Run Storybook and confirm every component from `data-model.md` appears under Components with one story per state and a usage note, and that nothing documented is missing.

### Implementation for User Story 2

- [ ] T037 [P] [US2] Add Button stories covering every state in `packages/components/src/components/button.stories.ts`
- [ ] T038 [P] [US2] Add Link stories covering every state in `packages/components/src/components/link.stories.ts`
- [ ] T039 [P] [US2] Add Paper stories in `packages/components/src/components/paper.stories.ts`
- [ ] T040 [P] [US2] Add Card stories in `packages/components/src/components/card.stories.ts`
- [ ] T041 [P] [US2] Add Input stories covering empty/focused/filled/disabled/invalid in `packages/components/src/components/input.stories.ts`
- [ ] T042 [P] [US2] Add Form field stories covering empty/focused/filled/disabled/invalid in `packages/components/src/components/form-field.stories.ts`
- [ ] T043 [P] [US2] Add Menu stories covering closed/open in `packages/components/src/components/menu.stories.ts`
- [ ] T044 [P] [US2] Add Menu item stories covering default/hover/focus/selected/disabled in `packages/components/src/components/menu-item.stories.ts`
- [ ] T045 [P] [US2] Add Tabs stories covering multiple selected indexes in `packages/components/src/components/tabs.stories.ts`
- [ ] T046 [P] [US2] Add Tab stories covering default/hover/focus/selected/disabled in `packages/components/src/components/tab.stories.ts`
- [ ] T047 [P] [US2] Add Tab panel stories covering hidden/shown in `packages/components/src/components/tab-panel.stories.ts`
- [ ] T048 [P] [US2] Add Dialog stories covering closed/open in `packages/components/src/components/dialog.stories.ts`
- [ ] T049 [US2] Add the catalogue overview page with a composed example (a sign-in card built from Card, Form field, Input, and Button) in `packages/components/src/stories/catalogue.mdx` (FR-020, SC-002)
- [ ] T050 [US2] Verify completeness against `data-model.md` (every component + every state has an entry) and run `pnpm --filter @project-reborn/components build-storybook`

**Checkpoint**: The catalogue is complete and builds cleanly (FR-016, FR-017, SC-001, SC-005).

---

## Deferred: User Story 3 (Slice 2) and variants

**Not part of this branch.** No tasks are generated for:

- **User Story 3 - Apply a consistent look & feel** (edges/corners, borders, elevation, typography feel): the token layer and the flat/surface look & feel.
- **Variants** of every component (named colour sets such as primary/secondary/danger; visual only).
- **Visual requirements** FR-013–FR-015 and FR-022, and SC-004 (contrast, WCAG AA).
- CSS anchor positioning of the Menu popover to its trigger.

These are added to the spec and plan when Slice 2 starts.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification for the slice.

- [ ] T051 [P] Run the full gates: `pnpm --filter @project-reborn/components test` and `pnpm --filter @project-reborn/components build-storybook`
- [ ] T052 [P] Run `pnpm --filter @project-reborn/components check` (svelte-check) and root `pnpm format`
- [ ] T053 [P] Validate the consumption example from `quickstart.md` (workspace dependency + Tailwind `@source` + rendering a FormField/Input/Button)
- [ ] T054 Confirm the Chrome DevTools accessibility tree shows correct roles/labels for Tabs, Menu, Dialog, and Form field

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: starts immediately (T002–T005 parallel after T001; T006 after T001)
- **Foundational (Phase 2)**: depends on Setup; BLOCKS both user stories
- **User Story 1 (Phase 3)**: starts after Foundational; no dependency on US2
- **User Story 2 (Phase 4)**: starts after Foundational; its stories render US1 components, so it depends on US1 in practice
- **Polish (Phase 5)**: after US1 and US2

### User Story Dependencies

- **US1 (P1)**: independent; delivers the components (MVP)
- **US2 (P2)**: renders US1's components; needs US1 complete to be meaningful

### Within User Story 1

- Tests (T011–T022) written first and failing
- T029 (`context.ts`) before the compound implementations that use it (T030–T034)
- T025 (Paper) before T026 (Card)
- T036 (exports) after all components

### Parallel Opportunities

- Setup: T002, T003, T004, T005 together
- Foundational: T008, T009 together
- US1 tests: T011–T022 all together
- US1 primitives: T023, T024, T025, T027 together
- US2 stories: T037–T048 all together

---

## Parallel Example: User Story 1

```bash
# Write all US1 tests together (must fail first):
Task: "Write Button tests in packages/components/src/components/button.test.ts"
Task: "Write Dialog tests in packages/components/src/components/dialog.test.ts"
# … T011–T022

# Implement the independent primitives together:
Task: "Implement Button in packages/components/src/components/button.svelte"
Task: "Implement Link in packages/components/src/components/link.svelte"
Task: "Implement Paper in packages/components/src/components/paper.svelte"
Task: "Implement Input in packages/components/src/components/input.svelte"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 User Story 1 (all twelve components)
3. **STOP and VALIDATE**: `pnpm --filter @project-reborn/components test`
4. Slice 1's value is already usable by a page, even without the catalogue

### Incremental Delivery

1. Setup + Foundational → toolchain ready
2. US1 → components work → test independently
3. US2 → catalogue complete → `build-storybook`
4. Slice 2 later adds the look & feel and variants without changing behaviour

---

## Notes

- [P] tasks touch different files and have no incomplete dependency
- [Story] labels map tasks to the spec's user stories (US1, US2)
- Variants and the look & feel are intentionally absent — they are visual-only and belong to Slice 2
- Commit after each task or logical group; never commit secrets
- Run the quickstart validation before declaring the slice done
