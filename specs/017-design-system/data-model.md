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

A condition a component can be in. A **browser-interaction state** is produced by interacting with the page and is not a separate catalogue entry; a **prop-driven state** is produced only by setting a prop and is the only kind shown as its own catalogue entry (FR-004). Surface visual states are defined for Button in the Variant and theme section below. Variants are prop-driven, so each variant is its own catalogue entry.

| Component | Catalogue entries |
|---|---|
| Button | default, green, dark, red (one catalogue entry per variant), wide, compact (one catalogue entry per size) |
| Link | default, white, personal-info, nav, settings, yellow (one catalogue entry per variant) |
| Input | default and border (one catalogue entry per variant: `Default`, `Border`), lg (one catalogue entry for the large size: `Large`; the `default` size is already shown by the `Default` entry), invalid (the prop-driven `invalid` state: `Invalid`) |
| Form field | default |
| Menu | default |
| Menu item | default |
| Tabs | default |
| Tab | default |
| Tab panel | default |
| Dialog | closed, open |
| Paper | default, login, gray, black, hc, yellow, lightgreen, blue, room pattern (one catalogue entry per variant) |
| Card | default (visual only; deferred) |

### Catalogue entry (story)

One Storybook story per component per prop-driven state, plus a usage note. A story is one catalogue entry; the stories are the acceptance surface. The spec calls this unit a *catalogue entry*; implementation docs call it a *story*.

| Field | Meaning | Constraint |
|---|---|---|
| component | The component shown | One catalogue entry per prop-driven state (FR-016, SC-001, SC-005) |
| state | The prop-driven state rendered | Every documented prop-driven state covered (FR-017, SC-001) |
| note | Short "when to use it" text | Required |

### Variant and theme (visual)

- **Variant** — a named set of appearance values (colours, border, text decoration) defined per component that gives it a meaning. Button's variants are `default`, `green`, `dark`, and `red`; Paper's are `default`, `login`, `gray`, `black`, `hc`, `yellow`, `lightgreen`, `blue`, and `room pattern`; Input's are `default` and `border`; Link's are `default`, `white`, `personal-info`, `nav`, `settings`, and `yellow`. A component's `variant` is optional and omitting it gives its `default` look. A variant changes appearance only, never behaviour or structure.
- **Size** — a named padding value, optional, whose omission gives the component's default look: Button's are `wide` (16px horizontal) and `compact` (8px horizontal); Input's are `default` (2px, all four sides) and `lg` (4px, all four sides). It changes only padding, never the other properties, behaviour, or structure (FR-025, FR-029).
- **Theme** — the application-level styling: edges/corners, borders, and typography feel (`flat`, `surface`). A theme is a description; each component defines its own styles to match it, and no shared theme variables exist yet. Slices 2 and 3 implement `surface` for Button, Paper, Input, and Link. The design system uses no elevation or shadows in any theme.

#### Button variant colour set

Each Button variant defines a text colour, a base colour (bg-1), a lighter raised face colour (bg-2), and a hover colour for each surface colour. The final values are the nearest Tailwind palette tokens (`tools/tw-color`, Tailwind v4.3.3); the spec's hex values are the original reference.

| Variant | Text | Base (bg-1) | Base (bg-1) hover | Face (bg-2) | Face (bg-2) hover |
|---|---|---|---|---|---|
| default | black | mauve-300 | olive-200 | olive-200 | white |
| green | white | lime-700 | green-600 | lime-600 | lime-500 |
| dark | white | olive-600 | neutral-500 | olive-500 | mist-400 |
| red | white | red-700 | red-600 | red-600 | red-500 |

#### Button size set

Each Button size defines its horizontal padding; the vertical padding and typography are fixed for the surface theme. The `size` is optional and omitted renders `wide` (FR-025).

| Size | Vertical padding | Horizontal padding |
|---|---|---|
| wide (default when omitted) | 4px | 16px |
| compact | 4px | 8px |

Button's surface-theme label is `12px` bold.

#### Button states (surface theme)

| State | Trigger | Appearance |
|---|---|---|
| default | no `variant` / `default` | base colour (bg-1) fills the button; face (bg-2) fills the upper half, inset 1px; 2px solid black border; 4px radius |
| hover | pointer over | the variant's hover colours for base and face |
| focus | keyboard focus | 2px offset black outline (`focus-visible`) |
| active (pressed) | pressed | bevel inverts: the face moves to the lower half |
| disabled | `disabled` | face removed, flattened to the base colour, dimmed, not-allowed cursor |

The label sits on the base colour; for the surface theme contrast is measured against the base colour and the face is a decorative highlight (FR-015). A future theme may require base and face together to meet AA.

**Contrast review (FR-015 / SC-004)** — reviewed against the Tailwind token values; WCAG AA normal text requires ≥ 4.5:1:

| Variant | Label on base (bg-1) | Ratio | AA |
|---|---|---|---|
| default | black on mauve-300 | 13.88:1 | ✔ |
| green | white on lime-700 | 4.96:1 | ✔ |
| dark | white on olive-600 | 6.91:1 | ✔ |
| red | white on red-700 | 6.42:1 | ✔ |

All four variants pass AA on the base colour; the face (bg-2) is a decorative highlight and is not measured for the surface theme.

#### Paper variant colour set

Each Paper variant defines its background colour. The final values are the nearest Tailwind palette tokens (`tools/tw-color`, Tailwind v4.3.3); the spec's hex values are the original reference. The `variant` is optional and omitted renders `default` (FR-026).

| Variant | Background |
|---|---|
| default | white |
| login | olive-400 |
| gray | neutral-400 |
| black | olive-950 |
| hc | amber-100 |
| yellow | amber-300 |
| lightgreen | mist-200 |
| blue | sky-300 |
| room pattern | cyan-600 |

The `room pattern` variant is a flat `cyan-600` background, not a pattern image. Paper defines backgrounds only and renders no text of its own, so the FR-015 text-contrast measurement does not apply to Paper; contrast is judged when text is placed on it.

#### Paper surface (surface theme)

| Property | Value |
|---|---|
| Border | 1px solid `black/20` on all four sides |
| Bottom border | 3px solid `black/20` (same colour) |
| Corner radius | 8px |
| Elevation | none — Paper never has a shadow |

A Paper `variant` changes only its background colour, never its border, radius, behaviour, or structure.

#### Input variant, size, and invalid sets

The final values are the nearest Tailwind palette tokens (`tools/tw-color`, Tailwind v4.3.3); the spec's hex values are the original reference. The `variant` is optional and omitted renders `default` (FR-027); the `size` is optional and omitted renders `default` (FR-029); `invalid` is an optional boolean (FR-028).

| Variant | Border |
|---|---|
| default | none |
| border | 1px solid `neutral-600` (spec `#555555`) |

| Size | Padding (all four sides) |
|---|---|
| default (default when omitted) | `p-0.5` (2px) |
| lg | `p-1` (4px) |

| `invalid` | Background |
|---|---|
| false (normal) | `white` |
| true | `rose-300` (spec `#f18f9b`) |

Input's normal state also uses `text-black`. A `variant` changes only the border, a `size` changes only the padding, and `invalid` changes only the background; none changes the others, behaviour, or structure.

#### Input surface (surface theme)

Input reuses Button's `focus-visible` outline. Input defines hover, focus, active, and disabled as browser-interaction states, so none is a catalogue entry (FR-004); the concrete hover, active, and disabled appearances are deferred to the theme (FR-031).

#### Link variant colour set

The final values are the nearest Tailwind palette tokens (`tools/tw-color`, Tailwind v4.3.3); the spec's hex values are the original reference. The `variant` is optional and omitted renders `default` (`#fc6204`, underlined) (FR-030). Link is an explicit WCAG AA exception (FR-015): the reference colours are kept where they fall below AA.

| Variant | Colour | Text decoration | Tailwind classes |
|---|---|---|---|
| default | `#fc6204` | underline | `text-orange-500 underline` |
| white | `#ffffff` | underline | `text-white underline` |
| personal-info | `#ffffff` | none | `text-white no-underline` |
| nav | `#134787` | none | `text-blue-900 no-underline` |
| settings | `#333333` | none | `text-olive-800 no-underline` |
| yellow | `#ffcc00` | underline | `text-amber-300 underline` |

A Link `variant` changes only its colour and text decoration, never behaviour or structure. Link defines hover, focus, and active as browser-interaction states (no disabled — an anchor cannot be natively disabled), so none is a catalogue entry (FR-004, FR-031); it reuses Button's `focus-visible` outline and defers its hover and active appearances to the theme.

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
| any | `invalid` prop true | invalid | background `rose-300`; border, padding, and text colour unchanged (FR-028) |

## Validation rules (from the spec)

- Every component prop-driven state MUST have a catalogue entry with a usage note (FR-016, SC-005).
- Every documented prop-driven state MUST appear in the catalogue (FR-017, SC-001).
- Interactive components MUST be keyboard operable with visible focus (FR-021, SC-003).
- A component used outside its documented prop states falls back to a sensible default (Edge Cases): Button falls back to `default`/`wide`, Paper falls back to `default`, Input falls back to `default`/`default`, and Link falls back to `default`.
- An application using a subset of components/variants is unaffected by ones it does not use (Edge Cases).
