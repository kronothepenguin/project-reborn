# Phase 1 Data Model: Design System

The design system has no persisted data. Its "model" is the set of components, the states each can be in, and the catalogue entries that must exist for acceptance. This file is the bridge between spec.md (Key Entities and requirements) and the component contracts.

## Entities

### Component

A reusable UI element with a single documented purpose. Fields:

| Field | Meaning | Constraint |
|---|---|---|
| name | Canonical PascalCase name | Unique across the system (FR-002) |
| element | The native element it renders or wraps | Must be semantic (button, a, dialog, input, div, …) |
| purpose | What it does, in one sentence | Required; used for the component's `Key Entities`/catalogue note |
| family | primitive \| container \| form \| navigation \| overlay | One per component |
| api | Props, snippets, callbacks | Defined in `contracts/components.md` |
| states | States it must render | From the state table below |
| composes | Components it uses or coordinates | See relationships |
| context | Context it provides/consumes | Only Tabs and Menu |

### State

A condition a component can be in. Behavioural states are in the spec (FR-004, FR-005, FR-009, FR-011); visual states belong to the variants slice.

| Component | States |
|---|---|
| Button | default, hover, focus-visible, active, disabled |
| Link | default, hover, focus-visible, active, disabled |
| Input | empty, focused, filled, disabled, invalid |
| Form field | empty, focused, filled, disabled, invalid (error) |
| Menu | closed, open |
| Menu item | default, hover, focus, selected, disabled |
| Tabs | selected index |
| Tab | default, hover, focus, selected, disabled |
| Tab panel | hidden, shown |
| Dialog | closed, open |
| Card / Paper | default (visual only; deferred) |

### Catalogue entry (Story)

One Storybook story per component per state, plus a usage note. This is the acceptance surface.

| Field | Meaning | Constraint |
|---|---|---|
| component | The component shown | One entry per baseline component (FR-016, SC-005) |
| state | The state rendered | Every documented state covered (FR-017, SC-001) |
| note | Short "when to use it" text | Required |

### Variant and look & feel (visual; Slice 2)

- **Variant** — a named set of colours giving a component a meaning (`primary`, `secondary`, `danger`, …), shared across applications. Changes colours only, never behaviour or structure. **Not part of Slice 1.**
- **Look & feel** — the application-level styling: edges/corners, borders, elevation, and typography feel (`flat`, `surface`). Changes between applications. **Not part of Slice 1.**

## Relationships

```text
Card  ──uses──▶  Paper          (Card sits on Paper — FR-006, FR-007)
Menu  ──contains─▶ Menu item    (one Menu, many items — FR-008)
Tabs  ──contains─▶ Tab          (one Tabs, many Tabs; owns selection — FR-010)
Tabs  ──contains─▶ Tab panel    (one panel per Tab, shown when its Tab is selected — FR-011)
Tab   ──controls─▶ Tab panel    (aria-controls / aria-labelledby link — FR-011)
Form field ──wraps─▶ any form control (input, Input, select, textarea); label + help + error, no caller id (FR-005)
Dialog ──contains─▶ arbitrary content (overlay — FR-012)
```

## State transitions

**Dialog**

| From | Event | To | Notes |
|---|---|---|---|
| closed | `open` / trigger | open | `showModal()`; content centered by the UA |
| open | Esc / backdrop / close / `method="dialog"` form | closed | Native dismissal (FR-012) |

**Menu**

| From | Event | To | Notes |
|---|---|---|---|
| closed | trigger activate | open | `showPopover()` (FR-008) |
| open | item selected | closed | selection reported to the consumer |
| open | light dismiss / Esc | closed | Native Popover behaviour |

**Tabs**

| From | Event | To | Notes |
|---|---|---|---|
| tab A selected | select tab B (click / Arrow / Home / End) | tab B selected | roving tabindex moves focus (FR-010, FR-011) |
| tab B selected | its panel | shown | only the selected Tab's panel is shown (FR-011) |

**Form field / Input**

| From | Event | To | Notes |
|---|---|---|---|
| empty | value entered | filled | |
| any | invalid submission | invalid | error message shown, `aria-invalid` set (FR-005) |
| any | disabled attribute set | disabled | non-interactive, still recognisable (Edge Cases) |

## Validation rules (from the spec)

- Every baseline component MUST have a catalogue entry with a usage note (FR-016, SC-005).
- Every documented state MUST appear in the catalogue (FR-017, SC-001).
- Interactive components MUST be keyboard operable with visible focus (FR-021, SC-003).
- A component used outside its documented states falls back to a sensible default (Edge Cases).
- An application using a subset of components/variants is unaffected by ones it does not use (Edge Cases).
