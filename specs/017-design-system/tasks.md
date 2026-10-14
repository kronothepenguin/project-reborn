---

description: "Task list for the Design System (Slice 2)"
---

# Tasks: Design System — Slice 2 (surface theme + Button and Paper variants)

**Input**: Design documents from `/specs/017-design-system/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because the plan defines `pnpm --filter @project-reborn/components test` (Vitest browser mode) as a gate and this slice adds observable `variant`/`size` props. The visible surface treatments themselves are verified in the Storybook catalogue.

**Scope**: This file covers **Slice 2 only**. Slice 1 (all twelve functional, unstyled components + catalogue + behaviour tests) is complete on this branch; its task list is in git history. Slice 2 delivers **User Story 3** for Button and Paper: the `surface` theme; Button's four variants (optional `variant`), two sizes (`size` optional, defaulting to `wide`), `4px`/`16px`/`8px` padding, and `12px` bold typography (FR-023–FR-025); and Paper's nine variants (optional `variant`) with its flat surface — no elevation, a `1px` `black/20` border, an `8px` radius, and a `3px` bottom border (FR-006, FR-026). The `flat` theme and the remaining components are Slice 3. A Storybook story is one catalogue entry. Tasks T001–T015 and T020–T023 are complete on this branch; the remaining tasks are the new Paper work.

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
- [X] T003 [P] Verify every token used by the Paper variant class map exists in the installed Tailwind palette (white, olive-400, neutral-400, olive-950, amber-100, amber-300, mist-200, sky-300, cyan-600, black/20) by rendering them through `packages/components/src/styles.css`; replace any missing token with its next-closest match and record the change in `data-model.md`.

**Checkpoint**: Token availability for the Button and Paper variants is confirmed.

---

## Phase 3: User Story 3 - Apply a consistent theme (Priority: P3) 🎯 Slice 2

**Goal**: Button renders the `surface` raised 3D treatment with its four variants, its two sizes, and visible hover, focus, active, and disabled states; Paper renders its flat surface with its nine variants; both change appearance only.

**Independent Test**: In Storybook, open each Button variant story and confirm the base colour (bg-1), raised face (bg-2), 2px black border, 4px radius, and the hover/focus/active/disabled states; open the `Wide` and `Compact` stories and confirm only the horizontal padding differs (16px vs 8px) while vertical padding (4px), typography (12px bold), behaviour, and structure stay the same. Open each Paper variant story and confirm the flat background, the 1px `black/20` border, the 8px radius, the 3px `black/20` bottom border, and no shadow; confirm `Room Pattern` is a flat background and that switching variant changes only the background colour.

### Tests for User Story 3 ⚠️

> Write first and ensure they FAIL before implementing.

- [X] T004 [US3] Write Button variant tests (variant is optional and defaults to `default`; each variant applies its class set; changing variant alters only classes, not the element or behaviour) in `packages/components/src/components/button.test.ts`
- [X] T005 [US3] Write Button size tests (size is optional and defaults to `wide`; `wide`/`compact` apply their horizontal-padding class; changing size alters only classes, not the element or behaviour; the surface-theme padding and `12px` bold typography classes are present) in `packages/components/src/components/button.test.ts`
- [X] T006 [US3] Write Paper variant tests (variant is optional and defaults to `default`; each variant applies its background class; changing variant alters only classes, not the element or behaviour; an unsupported variant falls back to `default`) in `packages/components/src/components/paper.test.ts`

### Implementation for User Story 3 — Button

- [X] T007 [US3] Add the optional `variant` prop (`"default" | "green" | "dark" | "red"`) and the static variant→class map (text, base/bg-1, base/bg-1 hover, face/bg-2, face/bg-2 hover colours) to `packages/components/src/components/button.svelte`
- [X] T008 [US3] Render the surface base (base colour, `2px` solid black border, `4px` radius) and the `::before` raised face (upper half, inset 1px from the border) with its hover colour in `packages/components/src/components/button.svelte`
- [X] T009 [US3] Add the `focus-visible` outline (2px offset black), the active inverted bevel (face moves to the lower half), and the disabled treatment (face removed, flattened to base, dimmed, not-allowed cursor) in `packages/components/src/components/button.svelte`
- [X] T010 [US3] Replace the single Button story with one story per prop-driven state — each variant (`Default`, `Green`, `Dark`, `Red`) — each with a usage note, in `packages/components/src/components/button.stories.ts` (a story is one catalogue entry)
- [X] T011 [US3] Update the catalogue overview note to describe the Button surface theme and its variants in `packages/components/src/stories/catalogue.mdx`
- [X] T012 [US3] Add the optional `size` prop (`"wide" | "compact"`) and the static size→horizontal-padding class map (`wide` 16px, `compact` 8px) to `packages/components/src/components/button.svelte`
- [X] T013 [US3] Apply the surface-theme padding (`4px` vertical, `16px`/`8px` horizontal) and `12px` bold typography to `packages/components/src/components/button.svelte`
- [X] T014 [US3] Add `Wide` and `Compact` Button stories, each with a usage note, in `packages/components/src/components/button.stories.ts` (a story is one catalogue entry)
- [X] T015 [US3] Update the catalogue overview note to describe Button's sizes and typography in `packages/components/src/stories/catalogue.mdx`

### Implementation for User Story 3 — Paper

- [X] T016 [US3] Add the optional `variant` prop (`"default" | "login" | "gray" | "black" | "hc" | "yellow" | "lightgreen" | "blue" | "room pattern"`) and the static variant→background class map (default `white`, login `olive-400`, gray `neutral-400`, black `olive-950`, hc `amber-100`, yellow `amber-300`, lightgreen `mist-200`, blue `sky-300`, room pattern `cyan-600`) to `packages/components/src/components/paper.svelte`
- [X] T017 [US3] Apply Paper's surface styling — a `1px` solid `black/20` border, an `8px` radius, and a `3px` bottom border in the same colour, with no elevation or shadow — to `packages/components/src/components/paper.svelte`
- [X] T018 [US3] Add nine Paper variant stories (`Default`, `Login`, `Gray`, `Black`, `HC`, `Yellow`, `Light Green`, `Blue`, `Room Pattern`), each with a usage note, in `packages/components/src/components/paper.stories.ts` (a story is one catalogue entry)
- [X] T019 [US3] Update the catalogue overview note to describe Paper's flat surface and its variants in `packages/components/src/stories/catalogue.mdx`

**Checkpoint**: Button and Paper are fully styled for the surface theme, each variant and each Button size is catalogued, and behaviour is unchanged.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification for Slice 2.

- [X] T020 [P] Run the gates `pnpm --filter @project-reborn/components test` and `pnpm --filter @project-reborn/components build-storybook` after the Button work
- [X] T021 [P] Run `pnpm --filter @project-reborn/components check` (svelte-check) and root `pnpm format` after the Button work
- [X] T022 Review each Button variant's label-on-base contrast in the catalogue against WCAG AA (default 13.88:1, green 4.96:1, dark 6.91:1, red 6.42:1; Tailwind token values) and record the result (FR-015, SC-004)
- [X] T023 Validate the Button Slice 2 scenarios in `quickstart.md`
- [X] T024 [P] Run the gates `pnpm --filter @project-reborn/components test` and `pnpm --filter @project-reborn/components build-storybook` after the Paper work
- [X] T025 [P] Run `pnpm --filter @project-reborn/components check` (svelte-check) and root `pnpm format` after the Paper work
- [X] T026 Validate the FR-006/FR-026 Paper surface and variant scenarios in `quickstart.md` (nine variants render; `Room Pattern` is a flat background; no elevation; border/radius as specified; Paper renders no text of its own, so no text-contrast measurement applies)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: starts immediately
- **Foundational (Phase 2)**: depends on Setup; BLOCKS User Story 3
- **User Story 3 (Phase 3)**: depends on Foundational
- **Polish (Phase 4)**: after User Story 3

### Within User Story 3

- T004/T005 (Button tests) and T006 (Paper tests) written first and failing
- Button: T007 (variant prop + class map) before T008 and T009 (styling consumes the map); T008 before T009 (base + face before the interaction states); T010 (stories) and T011 (catalogue) after the component renders; T012 (size prop + map) and T013 (padding/typography) after the variant work; T014 (size stories) after T012/T013; T015 (catalogue) after the component renders
- Paper: T016 (variant prop + map) before T017 (surface styling consumes the class); T018 (stories) after T016/T017; T019 (catalogue) after the component renders
- Button and Paper touch different files (`button.svelte`/`button.stories.ts` vs `paper.svelte`/`paper.stories.ts`), so the two component tracks can proceed in parallel

### Parallel Opportunities

- T003 (Paper token check) can run independently of the rest of Phase 2
- The Button track and the Paper track touch different files and can run in parallel
- T024 and T025 touch nothing but run gates, so they can run together
- T026 (quickstart validation) is independent of T024/T025

---

## Parallel Example: User Story 3

```bash
# Paper implementation tasks that touch different files:
Task: "Add the optional variant prop and static variant→background class map to packages/components/src/components/paper.svelte"
Task: "Add nine Paper variant stories, each with a usage note, in packages/components/src/components/paper.stories.ts"
```

---

## Implementation Strategy

### MVP First (User Story 3)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 User Story 3 (Button + Paper surface, variants, sizes, catalogue)
3. **STOP and VALIDATE**: `pnpm --filter @project-reborn/components test` and `build-storybook`
4. Slice 2's value is the styled, catalogued Button and Paper; behaviour is unchanged from Slice 1

### Incremental Delivery

1. Setup + Foundational → token availability confirmed
2. Button track (already delivered) → Button styled (variants + sizes) → test independently
3. Paper track → Paper styled (nine variants + flat surface) → test independently
4. Polish → gates, contrast review (Button), quickstart validation

---

## Notes

- [P] tasks touch different files and have no incomplete dependency
- [Story] labels map tasks to the spec's user stories (US3)
- Variant, size, padding, border, radius, and typography classes MUST be static literals so Tailwind's scanner emits them
- A story is one catalogue entry
- Only Button and Paper are styled; the `flat` theme and other components are Slice 3
- Deferred to Slice 3: FR-013 and FR-014 for the non-Button/Paper components (edges, borders, and typography feel for the rest of the system)
- Commit after each task or logical group; never commit secrets
- Run the quickstart validation before declaring the slice done
