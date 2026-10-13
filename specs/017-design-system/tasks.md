---

description: "Task list for the Design System (Slice 2)"
---

# Tasks: Design System — Slice 2 (surface theme + Button variants)

**Input**: Design documents from `/specs/017-design-system/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included because the plan defines `pnpm --filter @project-reborn/components test` (Vitest browser mode) as a gate and this slice adds an observable `variant` prop. The visible 3D states themselves are verified in the Storybook catalogue.

**Scope**: This file covers **Slice 2 only**. Slice 1 (all twelve functional, unstyled components + catalogue + behaviour tests) is complete on this branch; its task list (T001–T054) is in git history. Slice 2 delivers **User Story 3** for Button only: the `surface` theme, Button's four variants (`variant` is optional), and — added by the 2026-10-13 clarification — Button's two sizes (`size` is optional, defaulting to `wide`), its `4px`/`16px`/`8px` padding, and `12px` bold typography (FR-025). The `flat` theme and the remaining components are Slice 3. A Storybook story is one catalogue entry.

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

**Purpose**: Confirm the Slice 1 package and gates are green before styling.

- [X] T001 Run the existing gates to establish a green baseline: `pnpm --filter @project-reborn/components test` and `pnpm --filter @project-reborn/components build-storybook`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm the Tailwind build emits the variant tokens before the class strings are written.

**⚠️ CRITICAL**: Complete before User Story 3 tasks.

- [X] T002 Verify every token used by the Button variant class map exists in the installed Tailwind palette (mauve-300, olive-200, olive-500, olive-600, lime-500, lime-600, lime-700, green-600, neutral-500, mist-400, red-500, red-600, red-700, black, white) by rendering them through `packages/components/src/styles.css`; replace any missing token with its next-closest match and record the change in `data-model.md`.

**Checkpoint**: Token availability for the Button variants is confirmed.

---

## Phase 3: User Story 3 - Apply a consistent theme (Priority: P3) 🎯 Slice 2

**Goal**: Button renders the `surface` raised 3D treatment with its four variants, its two sizes, and visible hover, focus, active, and disabled states, changing appearance only.

**Independent Test**: In Storybook, open each Button variant story and confirm the base colour (bg-1), raised face (bg-2), 2px black border, 4px radius, and the hover/focus/active/disabled states; open the `Wide` and `Compact` stories and confirm only the horizontal padding differs (16px vs 8px) while vertical padding (4px), typography (12px bold), behaviour, and structure stay the same.

### Tests for User Story 3 ⚠️

> Write first and ensure they FAIL before implementing.

- [X] T003 [US3] Write Button variant tests (variant is optional and defaults to `default`; each variant applies its class set; changing variant alters only classes, not the element or behaviour) in `packages/components/src/components/button.test.ts`

### Implementation for User Story 3

- [X] T004 [US3] Add the optional `variant` prop (`"default" | "green" | "dark" | "red"`) and the static variant→class map (text, base/bg-1, base/bg-1 hover, face/bg-2, face/bg-2 hover colours) to `packages/components/src/components/button.svelte`
- [X] T005 [US3] Render the surface base (base colour, `2px` solid black border, `4px` radius) and the `::before` raised face (upper half, inset 1px from the border) with its hover colour in `packages/components/src/components/button.svelte`
- [X] T006 [US3] Add the `focus-visible` outline (2px offset black), the active inverted bevel (face moves to the lower half), and the disabled treatment (face removed, flattened to base, dimmed, not-allowed cursor) in `packages/components/src/components/button.svelte`
- [X] T007 [US3] Replace the single Button story with one story per prop-driven state — each variant (`Default`, `Green`, `Dark`, `Red`) — each with a usage note, in `packages/components/src/components/button.stories.ts` (a story is one catalogue entry)
- [X] T008 [US3] Update the catalogue overview note to describe the Button surface theme and its variants in `packages/components/src/stories/catalogue.mdx`

### Button size and typography (FR-025) — added by the 2026-10-13 clarification

> Write the tests first and ensure they FAIL before implementing.

- [X] T013 [US3] Write Button size tests (size is optional and defaults to `wide`; `wide`/`compact` apply their horizontal-padding class; changing size alters only classes, not the element or behaviour; the surface-theme padding and `12px` bold typography classes are present) in `packages/components/src/components/button.test.ts`
- [X] T014 [US3] Add the optional `size` prop (`"wide" | "compact"`) and the static size→horizontal-padding class map (`wide` 16px, `compact` 8px) to `packages/components/src/components/button.svelte`
- [X] T015 [US3] Apply the surface-theme padding (`4px` vertical, `16px`/`8px` horizontal) and `12px` bold typography to `packages/components/src/components/button.svelte`
- [X] T016 [US3] Add `Wide` and `Compact` Button stories, each with a usage note, in `packages/components/src/components/button.stories.ts` (a story is one catalogue entry)
- [X] T017 [US3] Update the catalogue overview note to describe Button's sizes and typography in `packages/components/src/stories/catalogue.mdx`

**Checkpoint**: Button is fully styled for the surface theme, each variant and each size is catalogued, and behaviour is unchanged.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification for Slice 2.

- [X] T009 [P] Run the gates `pnpm --filter @project-reborn/components test` and `pnpm --filter @project-reborn/components build-storybook`
- [X] T010 [P] Run `pnpm --filter @project-reborn/components check` (svelte-check) and root `pnpm format`
- [X] T011 Review each variant's label-on-base contrast in the catalogue against WCAG AA (default 13.88:1, green 4.96:1, dark 6.91:1, red 6.42:1; Tailwind token values) and record the result (FR-015, SC-004)
- [X] T012 Validate the Slice 2 scenarios in `quickstart.md`
- [X] T018 [P] Re-run the gates `pnpm --filter @project-reborn/components test`, `pnpm --filter @project-reborn/components build-storybook`, `pnpm --filter @project-reborn/components check` (svelte-check), and root `pnpm format` after the size and typography work
- [X] T019 Validate the FR-025 Button size and size-catalogue-entry scenarios in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: starts immediately
- **Foundational (Phase 2)**: depends on Setup; BLOCKS User Story 3
- **User Story 3 (Phase 3)**: depends on Foundational
- **Polish (Phase 4)**: after User Story 3

### Within User Story 3

- T003 (tests) written first and failing
- T004 (variant prop + class map) before T005 and T006 (styling consumes the map)
- T005 before T006 (base + face before the interaction states)
- T007 (stories) and T008 (catalogue) after the component renders
- T013 (size tests) written first and failing
- T014 (size prop + map) and T015 (padding/typography) before T016 (size stories); all three touch `button.svelte`/`button.stories.ts`
- T017 (catalogue) after the component renders

### Parallel Opportunities

- T009 and T010 touch nothing but run gates, so they can run together
- Implementation edits for T004–T006 all touch `button.svelte`, so they are sequential
- T018 touches nothing but runs gates, so it can run alongside T019

---

## Parallel Example: Polish

```bash
Task: "Re-run gates pnpm --filter @project-reborn/components test, build-storybook, check, and root pnpm format"
Task: "Validate the FR-025 Button size and size-catalogue-entry scenarios in quickstart.md"
```

---

## Implementation Strategy

### MVP First (User Story 3)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 User Story 3 (Button surface + variants + sizes + catalogue)
3. **STOP and VALIDATE**: `pnpm --filter @project-reborn/components test` and `build-storybook`
4. Slice 2's value is the styled, catalogued Button; behaviour is unchanged from Slice 1

### Incremental Delivery

1. Setup + Foundational → token availability confirmed
2. US3 component work → Button styled (variants + sizes) → test independently
3. US3 catalogue work → variants and sizes visible → `build-storybook`
4. Polish → gates, contrast review, quickstart validation

---

## Notes

- [P] tasks touch different files and have no incomplete dependency
- [Story] labels map tasks to the spec's user stories (US3)
- Variant, size, padding, and typography classes MUST be static literals so Tailwind's scanner emits them
- A story is one catalogue entry
- Only Button is styled; the `flat` theme and other components are Slice 3
- Deferred to Slice 3: FR-013 and FR-014 for the non-Button components (edges, borders, elevation, and typography feel for the rest of the system); Slice 2 defines them for Button only
- Commit after each task or logical group; never commit secrets
- Run the quickstart validation before declaring the slice done
