---

description: "Task list for the Design System (Slice 3)"
---

# Tasks: Design System — Slice 3 (surface theme + Input and Link variants)

**Input**: Design documents from `/specs/017-design-system/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because the plan defines `pnpm --filter @project-reborn/components test` (Vitest browser mode) as a gate and this slice adds observable `variant`/`size`/`invalid` props. The visible surface treatments themselves are verified in the Storybook catalogue.

**Scope**: This file covers **Slice 3 only**. Slices 1 (all twelve functional, unstyled components) and 2 (surface theme for Button and Paper) are complete on this branch; their task lists are in git history. Slice 3 delivers **User Story 3** for Input and Link: the `surface` theme; Input's two variants (optional `variant`: `default` no border, `border` 1px solid `#555`), two sizes (optional `size`: `default` 2px, `lg` 4px, padding on all four sides), and optional boolean `invalid` (background `#f18f9b`) with a white/black normal state (FR-027–FR-029); and Link's six variants (optional `variant`: `default`, `white`, `personal-info`, `nav`, `settings`, `yellow`) with colour + text-decoration (FR-030). Both define hover/focus/active as browser-interaction states (Input also disabled) with the shared `focus-visible` outline and no catalogue entries (FR-031). Link is an explicit WCAG AA exception (FR-015/SC-004). The `flat` theme and the remaining components are Slice 4. A Storybook story is one catalogue entry.

**Organization**: Tasks are grouped by phase and map to User Story 3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US3)
- Every task includes an exact file path

## Path Conventions

- Package root: `packages/components/`
- Components, tests, and stories: `packages/components/src/components/`
- Catalogue overview: `packages/components/src/stories/`
- Paths are project-relative.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the delivered Slice 1 and Slice 2 package and gates are green before styling.

- [x] T001 Run the existing gates to establish a green baseline: `pnpm --filter @project-reborn/components test` and `pnpm --filter @project-reborn/components build-storybook`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm the Tailwind build emits the Input and Link tokens before the class strings are written.

**⚠️ CRITICAL**: Complete before User Story 3 tasks.

- [x] T002 Verify every token used by the Input and Link class maps exists in the installed Tailwind palette (neutral-600, rose-300, white, black, orange-500, blue-900, olive-800, amber-300) by rendering them through `packages/components/src/styles.css`; replace any missing token with its next-closest match and record the change in `data-model.md`.

**Checkpoint**: Token availability for the Input and Link variants is confirmed.

---

## Phase 3: User Story 3 - Apply a consistent theme (Priority: P3) 🎯 Slice 3

**Goal**: Input renders its white/black normal state with the `default`/`border` variants, the `default`/`lg` sizes (padding on all four sides), and the `invalid` background; Link renders its six colour + text-decoration variants; both reuse Button's `focus-visible` outline and change appearance only.

**Independent Test**: In Storybook, open each Input story and confirm `Default` has no border, `Border` has a 1px solid `#555` border, `Default`/`Big` differ only in padding (2px vs 4px on all four sides), and `Invalid` shows the `#f18f9b` background with border, padding, and text colour unchanged; open each Link story and confirm its colour and text decoration (only `Personal Info`, `Nav`, and `Settings` remove the underline). Confirm across variants that behaviour and structure are identical and that no hover/focus/active/disabled state has its own story.

### Tests for User Story 3 ⚠️

> Write first and ensure they FAIL before implementing.

- [x] T003 [P] [US3] Write Input tests (variant is optional and defaults to `default`; `border` applies its border class; `size` is optional and defaults to `default`; `default`/`lg` apply their all-sides padding class; `invalid` is optional and defaults to `false` and applies its background class; changing variant/size/invalid alters only classes, not the element or behaviour; an unsupported variant or size falls back to `default`) in `packages/components/src/components/input.test.ts`; assert the shared `focus-visible` outline is applied and that hover/active/disabled produce no catalogue entry and do not change the element or behaviour
- [x] T004 [P] [US3] Write Link tests (variant is optional and defaults to `default`; each variant applies its colour and text-decoration classes; changing variant alters only classes, not the element or behaviour; an unsupported variant falls back to `default`) in `packages/components/src/components/link.test.ts`; assert the shared `focus-visible` outline is applied and that hover/active produce no catalogue entry and do not change the element or behaviour

### Implementation for User Story 3 — Input

- [x] T005 [US3] Add the optional `variant` prop (`"default" | "border"`) and the static variant→border class map (`default` = no border, `border` = 1px solid `neutral-600`) to `packages/components/src/components/input.svelte`
- [x] T006 [US3] Add the optional `size` prop (`"default" | "lg"`) and the static size→all-sides-padding class map (`default` = `p-0.5` 2px, `lg` = `p-1` 4px) to `packages/components/src/components/input.svelte`
- [x] T007 [US3] Add the optional `invalid` prop (default `false`) with the `bg-rose-300` background, the normal state `bg-white text-black`, and the shared `focus-visible` outline to `packages/components/src/components/input.svelte`
- [x] T008 [US3] Add Input stories — `Default` and `Border` (one per variant), `Large` (the `lg` size; no separate default-size story, because the `Default` entry already shows the default size), and `Invalid` — each with a usage note, in `packages/components/src/components/input.stories.ts` (a story is one catalogue entry)

### Implementation for User Story 3 — Link

- [x] T009 [US3] Add the optional `variant` prop (`"default" | "white" | "personal-info" | "nav" | "settings" | "yellow"`), the static variant→(colour + text-decoration) class map (`default`/`white`/`yellow` underlined, `personal-info`/`nav`/`settings` no underline), and the shared `focus-visible` outline to `packages/components/src/components/link.svelte`
- [x] T010 [US3] Add six Link variant stories (`Default`, `White`, `Personal Info`, `Nav`, `Settings`, `Yellow`), each with a usage note — including a note that Link keeps its reference colours where they fall below WCAG AA (FR-015/SC-004) — in `packages/components/src/components/link.stories.ts` (a story is one catalogue entry)
- [x] T011 [US3] Update the catalogue overview note to describe the Input surface theme (variants, sizes, `invalid`) and the Link variants in `packages/components/src/stories/catalogue.mdx`

**Checkpoint**: Input and Link are fully styled for the surface theme, every variant, every Input `size`, and the Input `invalid` state is catalogued, and behaviour is unchanged.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification for Slice 3.

- [x] T012 [P] Run the gates `pnpm --filter @project-reborn/components test` and `pnpm --filter @project-reborn/components build-storybook` after the Input work
- [x] T013 [P] Run `pnpm --filter @project-reborn/components check` (svelte-check) and root `pnpm format` after the Input work
- [x] T014 Validate the Input Slice 3 scenarios in `quickstart.md` (two variants, normal + `invalid` states, two sizes changing only all-sides padding)
- [x] T015 [P] Run the gates `pnpm --filter @project-reborn/components test` and `pnpm --filter @project-reborn/components build-storybook` after the Link work
- [x] T016 [P] Run `pnpm --filter @project-reborn/components check` (svelte-check) and root `pnpm format` after the Link work
- [x] T017 Validate the Link Slice 3 scenarios in `quickstart.md` (six variants, colour/decoration only, the documented AA exception, no disabled state)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: starts immediately
- **Foundational (Phase 2)**: depends on Setup; BLOCKS User Story 3
- **User Story 3 (Phase 3)**: depends on Foundational
- **Polish (Phase 4)**: after User Story 3

### Within User Story 3

- T003/T004 (tests) written first and failing
- Input: T005 (variant prop + map) before T006/T007 (they add to the same component); T008 (stories) after the component renders
- Link: T009 (variant prop + map + focus outline) before T010 (stories)
- T011 (catalogue) after both components render
- Input and Link touch different files (`input.svelte`/`input.stories.ts` vs `link.svelte`/`link.stories.ts`), so the two component tracks can proceed in parallel

### Parallel Opportunities

- T003 and T004 (Input and Link tests) are separate files and can run together
- The Input track and the Link track touch different files and can run in parallel
- T012/T013 and T015/T016 run only gates/checks, so they can run in parallel
- T014 and T017 (quickstart validation) are independent of the gate tasks

---

## Parallel Example: User Story 3

```bash
# Input and Link test files are independent:
Task: "Write Input tests in packages/components/src/components/input.test.ts"
Task: "Write Link tests in packages/components/src/components/link.test.ts"

# Component implementation tracks that touch different files:
Task: "Add the optional variant prop and static variant→border class map to packages/components/src/components/input.svelte"
Task: "Add the optional variant prop and static variant→(colour + text-decoration) class map to packages/components/src/components/link.svelte"
```

---

## Implementation Strategy

### MVP First (User Story 3)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 User Story 3 (Input + Link surface, variants, sizes, `invalid`, catalogue)
3. **STOP and VALIDATE**: `pnpm --filter @project-reborn/components test` and `build-storybook`
4. Slice 3's value is the styled, catalogued Input and Link; behaviour is unchanged from Slice 1

### Incremental Delivery

1. Setup + Foundational → token availability confirmed
2. Input track → Input styled (variants + sizes + `invalid`) → test independently
3. Link track → Link styled (six variants) → test independently
4. Polish → gates, quickstart validation

---

## Notes

- [P] tasks touch different files and have no incomplete dependency
- [Story] labels map tasks to the spec's user stories (US3)
- Variant, size, padding, border, and colour classes MUST be static literals so Tailwind's scanner emits them
- A story is one catalogue entry; hover, focus, active, and Input's disabled are browser-interaction states with no story (FR-004)
- Only Input and Link are styled in this slice; the `flat` theme and other components are Slice 4
- Deferred to Slice 4: FR-013 and FR-014 for the remaining components (edges, borders, and typography feel for the rest of the system)
- Link keeps its reference colours where they fall below WCAG AA (FR-015/SC-004) and has no `disabled` state
- Commit after each task or logical group; never commit secrets
- Run the quickstart validation before declaring the slice done
