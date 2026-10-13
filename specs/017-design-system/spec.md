# Feature Specification: Design System

**Feature Branch**: `017-design-system`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: "Design system of reusable UI components and variants, shared across the project's applications (not scoped to a single application)"

## Background

Project Reborn remakes Habbo Hotel as it was around 2008. The project builds several applications, and their interfaces must share one set of components. Without it, every application reinvents its buttons, cards, and forms, and behaviour drifts.

This specification defines the project's design system: the reusable UI components, the variants and themes they support, and the catalogue page that shows every component and its prop-driven states. It is one shared system; applications differ by their theme and the variants they select, not by forking components. It defines what the components are and how they must behave; it does not define how they are built, which language, framework, or styling approach is used.

## Scope

The design system is one shared system for the project's applications. Each application adopts it, applies a theme, and selects the variants it needs, so applications can look different while sharing the same components and behaviour. Which theme and which variants each application uses is out of scope for this specification and is decided when that application is built. The catalogue page is an internal reference surface for people building the project's interfaces, not a public page.

## Variants and Themes

The design system separates what a component is (its behaviour and states) from how it is presented, through two independent visual axes. Neither changes a component's behaviour or structure.

- **Variant** — a named set of colours defined per component that gives it a meaning. Different components have their own variant sets (for example, Button's are `default`, `green`, `dark`, and `red`). The `variant` is optional: when it is omitted the component renders its `default` look. A variant changes only colours, never behaviour or structure. Because a component is shared across applications, its variants are the same in every application.
- **Theme** (the look & feel) — the application-level styling: edges and corners, borders, elevation, and typography feel. Themes are `flat` (flat surfaces, sharp edges) and `surface` (raised, 3D hotel style). A theme is a description of how components should look; it has no shared variables, and each component defines its own edges, borders, elevation, and typography to match it. A `Theme` component that shares the theme through context is a later addition; this slice builds the `surface` theme only.
- **Elevation** — how raised a surface appears (its shadow). Elevation is part of the theme.

Any theme combines with any variant. Applications choose their theme and their variants; components and their behaviour stay the same.

### Button variants and the surface theme

Button defines four variants. Each variant defines a text colour, a base colour (bg-1), a lighter raised face colour (bg-2), and a hover colour for each surface colour. The hex values are the original reference; the implementation uses the nearest Tailwind palette tokens (see the plan).

| Variant | Text | Base (bg-1) | Base (bg-1) hover | Face (bg-2) | Face (bg-2) hover |
|---|---|---|---|---|---|
| default | #000000 | #cccccc | #eaeaea | #eaeaea | #ffffff |
| green | #ffffff | #2c7e00 | #339d00 | #3ba800 | #45cb00 |
| dark | #ffffff | #606060 | #7c7c7c | #888888 | #a8a8a8 |
| red | #ffffff | #b50000 | #d70000 | #de0000 | #ff1616 |

The `variant` is optional; when it is omitted Button renders its `default` variant.

In the surface theme a button is a raised, 3D control: the base colour (bg-1) fills the whole control and the lighter face colour (bg-2) fills the upper half, inset from the border, so the top edge appears lit. A button has a 2px solid black border and a 4px corner radius. This 3D treatment is specific to the Button for now; other components define their own.

Button's surface-theme typography is 12px bold. Button also has an optional `size` prop that changes only the horizontal padding; it never changes the vertical padding, typography, colours, behaviour, or structure. When `size` is omitted Button behaves like `wide`:

| Size | Vertical padding | Horizontal padding |
|---|---|---|
| wide (default when omitted) | 4px | 16px |
| compact | 4px | 8px |

A button's label sits on the base colour. For the surface theme the face is a decorative highlight, so contrast is measured against the base colour (FR-015); a future theme may require the base and face together to meet text-on-colour contrast.

## Clarifications

### Session 2026-10-10

- Q: What is the baseline component inventory? → A: button, card, link, paper, input, form field, menu, menu item, tab.
- Q: Should Badge and Dialog remain part of the baseline? → A: Keep Dialog only; drop Badge.
- Q: What does the "Paper" component represent, and how does it differ from "Card"? → A: Paper is the plain surface/background primitive; Card is a structured content container built on Paper.
- Q: What does the "Form field" component cover relative to "Input"? → A: Form field is a generic wrapper: it provides the label, optional help text, and the error message, and takes any form control (input, Input, select, textarea) as its child; the label associates by wrapping, so no caller-supplied id is needed.
- Q: How should Menu, Menu item, and Tab behave? → A: All are interactive; Menu item is selectable and Tab selects among sibling panels.
- Q: Should a parent Tabs component own selection and its panels, or should pages wire up Tab behaviour? → A: Add a parent Tabs component that owns selection, keyboard navigation, and its panels; Tab and its panel are children.
- Q: Should the design system stay scoped to the CMS, or be generic across the project's applications? → A: Generic; drop all CMS references, keep one shared system, and let each application differ by its theme and variants.
- Q: Should component variants (visual/colour changes) be listed in the spec? → A: Not per component; the spec's requirements stay focused on what each component does. Button's variants and its surface colours are defined in "Button variants and the surface theme" (see the 2026-10-13 sessions below).

### Session 2026-10-13

- Q: Which component states should be separate catalogue entries? → A: Only prop-driven states that cannot be produced by interacting with the page; states produced by page interaction MUST NOT have their own catalogue entry.
- Q: How should the catalogue treat each baseline component's prop-driven states? → A: Each prop-driven state gets its own catalogue entry; Button has one per variant (`default`, `green`, `dark`, `red`) and Dialog has Closed and Open.
- Q: Which artifacts should reflect this? → A: spec.md, data-model.md, research.md, plan.md, tasks.md, quickstart.md, and contracts/.
- Q: Which names should Button's variants use? → A: The colour names given: `default`, `green`, `dark`, and `red`; they replace the earlier illustrative `primary`/`secondary`/`danger`/`success`/`neutral` list.
- Q: Is the raised two-colour button treatment a shared surface theme rule or button-specific? → A: Button-specific for now; each component defines its own styling and no shared theme variables exist yet.
- Q: What text colour do the dark and red variants use? → A: White (#ffffff) on both.
- Q: How is WCAG AA contrast judged for the two-tone button surface? → A: Against the base colour; the lighter upper half is a decorative highlight.
- Q: Which non-hover button states does this slice define? → A: Hover, focus, active (pressed), and disabled.
- Q: Are variants shared across all components, or defined per component? → A: Per component; each component has its own variant set, and its `variant` is always optional (`default` is the no-prop look).
- Q: What is the normalized term for the application-level styling? → A: `theme` (described as the look & feel). `base`/`face` are the normalized names for `bg-1`/`bg-2`.
- Q: Can the surface theme's face be exempt from text-on-colour contrast forever? → A: No; for the surface theme the face is decorative, but a future theme may require the base and face together to meet AA.
- Q: In the spec, what is the catalogue unit called? → A: `catalogue entry`; implementation docs call a Storybook story one catalogue entry.
- Q: When Button's `size` prop is omitted, which horizontal padding should it use, and what are the two size value names? → A: Omitted behaves like `wide` (16px); values are `wide` and `compact` (8px).
- Q: How should Button's `size` values appear in the catalogue relative to its four variant entries? → A: Four variant entries, plus separate entries showing each `size` value.
- Q: Should Button's new padding and typography apply in every theme or surface theme only? → A: Surface-theme-specific; they are part of the surface theme's Button description.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build UI from a shared component set (Priority: P1)

A person building an application interface reaches for an existing component (a button, a card, a form field) instead of writing page-specific UI, so every interface behaves the same way.

**Why this priority**: The components are the design system; without them, there is nothing to reuse or document, and every interface remains bespoke.

**Independent Test**: Assemble a representative application page using only components from the design system, without bespoke UI code, and confirm each component renders and behaves correctly.

**Acceptance Scenarios**:

1. **Given** the design system's component set, **When** a builder assembles a page, **Then** every UI element on that page comes from the component set and no page-specific UI code is required.
2. **Given** the same component used in two different places, **When** both are used, **Then** they behave identically.
3. **Given** a component with different props, **When** it renders, **Then** it renders as documented without changing the component's structure.

---

### User Story 2 - Review every component in one catalogue (Priority: P2)

A person building or reviewing interfaces opens a single catalogue page that shows every component and its prop-driven states, with a short note on when to use it, so they can compare, choose, and spot anything missing.

**Why this priority**: The catalogue is how the design system is discovered, reviewed, and verified; it turns the component set into something usable and testable.

**Independent Test**: Open the catalogue page and confirm that every component appears with a usage note, and that nothing documented is missing.

**Acceptance Scenarios**:

1. **Given** the catalogue page, **When** it loads, **Then** it shows every component, each with a usage note.
2. **Given** a component added to the design system, **When** the catalogue is reviewed, **Then** that component and its prop-driven states are present, and a component missing from the catalogue is treated as a defect.
3. **Given** a catalogue entry, **When** it is read, **Then** it shows the component, its prop-driven states, and a short note describing when to use it.

---

### User Story 3 - Apply a consistent theme (Priority: P3)

A person building an interface relies on one shared theme — edges and corners, borders, elevation, and typography feel — so interfaces feel like the same product, while each application can still look different.

**Why this priority**: A consistent theme is what makes the components look like one family; it refines the components but the components still deliver value without it.

**Independent Test**: Render components from different places and confirm each follows the same theme's edges, borders, elevation, and typography feel.

**Acceptance Scenarios**:

1. **Given** a theme, **When** a component is rendered, **Then** it presents the theme's edges, borders, elevation, and typography feel.
2. **Given** two components of the same kind in different places, **When** they are compared, **Then** their theme looks identical.

---

### Edge Cases

- A component is used with an undefined or unsupported prop value: it must fall back to a sensible default rather than break or render unstyled (for Button, an unsupported `variant` falls back to `default` and an unsupported `size` falls back to `wide`).
- Content longer than expected inside a card, menu item, or button: overflow MUST be handled by wrapping or truncation rather than breaking the layout.
- A disabled or non-interactive component must not respond to interaction but must remain recognisable.
- A component that should appear in the catalogue is absent: this is a catalogue defect and fails acceptance.
- An application selects only some variants and one theme: components or variants it does not use are simply absent and must not affect the ones it does use.

## Requirements *(mandatory)*

### Functional Requirements

#### Components

- **FR-001**: The design system MUST provide a documented, reusable set of UI components shared across the project's applications.
- **FR-002**: The baseline component set MUST include at least: Button, Link, Card, Paper, Input, Form field, Menu, Menu item, Tabs, Tab, Tab panel, and Dialog.
- **FR-003**: Each component MUST render correctly in its baseline and in each documented prop-driven state. A variant MUST change only a component's colours, never its behaviour or structure.
- **FR-004**: A state produced by interacting with the page MUST NOT be a separate catalogue entry; only a prop-driven state that cannot be produced by interaction MUST be shown as its own catalogue entry. This rule governs the catalogue (FR-016, FR-017).
- **FR-005**: Form field MUST provide a visible label, a control area that accepts any form control, optional help text, and an error message. The label MUST be associated with the control without requiring a caller-supplied identifier.
- **FR-006**: Paper MUST provide the plain surface/background primitive.
- **FR-007**: Card MUST present a structured container for grouped content and MUST sit on Paper.
- **FR-008**: Menu MUST present a list of Menu items.
- **FR-009**: Menu item MUST be a selectable entry.
- **FR-010**: Tabs MUST be the parent component that groups its Tab children, owns which Tab is selected, and provides keyboard navigation among them.
- **FR-011**: Tab MUST select among sibling panels and MUST expose a selected state; Tab panel MUST show the content linked to its Tab and MUST be shown only while its Tab is selected.
- **FR-012**: Dialog MUST support open and closed, MUST be dismissible, and MUST NOT allow interaction with the page behind it while open.

#### Variants and themes

- **FR-013**: The design system MUST define a theme covering edges and corners, borders, elevation, and typography feel. A theme describes how components look and MUST NOT change component behaviour.
- **FR-014**: Components MUST present the selected theme's look & feel — each component defines its own edges, borders, elevation, and typography to match the theme (no shared theme variables exist yet) — and variant colours MUST come from the component's own defined variants rather than ad-hoc values.
- **FR-015**: Text and text-on-colour combinations MUST meet the WCAG AA minimum contrast defined in Assumptions. For the surface theme, the label is measured against the base colour (bg-1) and the lighter face (bg-2) is a decorative highlight; a future theme MAY require the base and face together to meet text-on-colour contrast.

#### Catalogue

- **FR-016**: Every component MUST have a catalogue entry for each of its documented prop-driven states, each with a short note on when to use it (SC-001, SC-005). Once variants are defined, every variant MUST have its own catalogue entry showing its colours. Button's `size` values MUST each have their own catalogue entry.
- **FR-017**: The design system MUST provide a single catalogue page that renders every component and its documented prop-driven states.
- **FR-018**: The catalogue page MUST be reachable for the people building the project's interfaces.
- **FR-019**: A component that exists in the design system but is missing from the catalogue MUST be treated as a defect.

#### Reuse and behaviour

- **FR-020**: An application page MUST be assemblable using only design-system components, without page-specific UI code.
- **FR-021**: Interactive components MUST be operable by keyboard and MUST show a visible focus indicator.
- **FR-022**: The design system MUST be one shared system for the project's applications; differences between applications MUST be expressed through each application's theme and the variants it selects, not by duplicating components.
- **FR-023**: Button MUST support its variants (`default`, `green`, `dark`, `red`) defined in "Button variants and the surface theme"; `variant` MUST be optional and default to `default`, and changing variant MUST change only colours.
- **FR-024**: In the surface theme, Button MUST render the raised two-colour treatment (base colour plus a lighter upper-half face, 2px solid black border, 4px corner radius), MUST use 4px vertical padding and 12px bold typography, and MUST show visually distinct hover, focus, active (pressed), and disabled states.
- **FR-025**: Button MUST support an optional `size` prop that changes only its horizontal padding; in the surface theme the values are `wide` (16px) and `compact` (8px). `size` MUST default to `wide` when omitted, and changing it MUST NOT change the vertical padding, typography, colours, behaviour, or structure. A future theme MAY define different size values.

### Key Entities

- **Component**: a reusable UI element with a single documented purpose (for example Button or Card).
- **Variant**: a named set of colours defined per component that gives it a meaning (Button's are `default`, `green`, `dark`, `red`); the `variant` is optional and omitting it gives the component's `default` look.
- **Size**: a named horizontal-padding value for Button (`wide`, `compact`); the `size` is optional and omitting it gives the `wide` look.
- **State**: a condition a component can be in. A **browser-interaction state** is produced by interacting with the page and is not a separate catalogue entry; a **prop-driven state** is produced only by setting a prop and is the only kind shown as its own catalogue entry.
- **Theme**: a documented description of how components look — edges, borders, elevation, and typography feel — that each component's own styles follow. No shared theme values exist yet.
- **Catalogue entry**: the documentation and live preview for one component prop-driven state, covering its documented states and, once defined, its variant colours.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the baseline components appear on the catalogue page, each with its documented prop-driven states.
- **SC-002**: A representative page (for example a sign-in card built from Card, Form field, Input, and Button) is assembled using only design-system components, with zero page-specific UI code, and works functionally.
- **SC-003**: 100% of interactive components are operable by keyboard and show a visible focus indicator.
- **SC-004**: 100% of text and text-on-colour combinations meet the WCAG AA minimum contrast, verified by human review of the catalogue. For the surface theme the label is measured against the base colour; the face is decorative.
- **SC-005**: Every catalogue entry includes a usage note, measured as zero catalogue entries lacking a note.

## Assumptions

- The design system is a single shared system for the project's applications; the theme and variants each application uses are decided when that application is built.
- Applications can look different by applying a different theme and variants while sharing the same components and behaviour.
- The theme and variant definitions are visual: they change appearance, never behaviour.
- The catalogue page is an internal reference surface for people building the project's interfaces, not a public page.
- The theme targets the classic 2008 hotel style; layout is desktop-first and fixed, and small-screen/mobile support is out of scope.
- Modern evergreen browsers are assumed, because the game client runs in them.
- Content is in English.
- The minimum contrast target is WCAG AA (4.5:1 for normal text, 3:1 for large text and interactive boundaries), judged by human review.
- The styling approach used to build the components is decided in the plan, not in this specification.
