# Phase 1 Data Model: Design System

The design system has no persisted data. Its "model" is the set of components, the prop-driven states each can be in, and the catalogue entries that must exist for acceptance. This file is the bridge between spec.md (Key Entities and requirements) and the component contracts.

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
| states | Prop-driven states it must render | From the state table below |
| composes | Components it uses or coordinates | See relationships |
| context | Context it provides/consumes | Only Tabs and Menu |

### State

A condition a component can be in. A **browser-interaction state** is produced by interacting with the page and is not a separate catalogue entry; a **prop-driven state** is produced only by setting a prop and is the only kind shown as its own entry (FR-004). Visual states belong to the variants slice. The baseline `default` entry is required by FR-016 and is not a state.

| Component | Catalogue entries |
|---|---|
| Button | default |
| Link | default |
| Input | default |
| Form field | default |
| Menu | default |
| Menu item | default |
| Tabs | default |
| Tab | default |
| Tab panel | default |
| Dialog | closed, open |
| Card / Paper | default (visual only; deferred) |

### Catalogue entry (Story)

One Storybook story per component per prop-driven state, plus a usage note. This is the acceptance surface.

| Field | Meaning | Constraint |
|---|---|---|
| component | The component shown | One entry per baseline component (FR-016, SC-005) |
| state | The prop-driven state rendered | Every documented prop-driven state covered (FR-017, SC-001) |
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
| any | invalid submission | invalid | error message shown, `aria-invalid` set (FR-005) |

## Validation rules (from the spec)

- Every baseline component MUST have a catalogue entry with a usage note (FR-016, SC-005).
- Every documented prop-driven state MUST appear in the catalogue (FR-017, SC-001).
- Interactive components MUST be keyboard operable with visible focus (FR-021, SC-003).
- A component used outside its documented prop states falls back to a sensible default (Edge Cases).
- An application using a subset of components/variants is unaffected by ones it does not use (Edge Cases).
