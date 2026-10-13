# Feature Specification: Design System

**Feature Branch**: `017-design-system`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: "Design system of reusable UI components and variants, shared across the project's applications (not scoped to a single application)"

## Background

Project Reborn remakes Habbo Hotel as it was around 2008. The project builds several applications, and their interfaces must share one set of components. Without it, every application reinvents its buttons, cards, and forms, and behaviour drifts.

This specification defines the project's design system: the reusable UI components, the variants and look & feel they support, and the catalogue page that shows every component in every state. It is one shared system; applications differ by their look & feel and the variants they select, not by forking components. It defines what the components are and how they must behave; it does not define how they are built, which language, framework, or styling approach is used.

## Scope

The design system is one shared system for the project's applications. Each application adopts it, applies a look & feel, and selects the variants it needs, so applications can look different while sharing the same components and behaviour. Which look & feel and which variants each application uses is out of scope for this specification and is decided when that application is built. The catalogue page is an internal reference surface for people building the project's interfaces, not a public page.

## Variants and Look & Feel

The design system separates what a component is (its behaviour and states) from how it is presented, through two independent visual axes. Neither changes a component's behaviour or structure.

- **Variant** — a named set of colours that gives a component a meaning, for example `primary`, `secondary`, `danger`, `success`, and `neutral`. Variants are shared across applications: `primary` means the same thing everywhere, and each application chooses which variants it uses.
- **Look & feel** — the application-level styling (the application's theme): edges and corners, borders, elevation, and typography feel. Examples are `flat` (flat surfaces, sharp edges) and `surface` (raised, 3D hotel style). The look & feel changes between applications.
- **Elevation** — how raised a surface appears (its shadow). Elevation is part of the look & feel.

Any look & feel combines with any variant. Applications choose their look & feel and their variants; components and their behaviour stay the same.

## Clarifications

### Session 2026-10-10

- Q: What is the baseline component inventory? → A: button, card, link, paper, input, form field, menu, menu item, tab.
- Q: Should Badge and Dialog remain part of the baseline? → A: Keep Dialog only; drop Badge.
- Q: What does the "Paper" component represent, and how does it differ from "Card"? → A: Paper is the plain surface/background primitive; Card is a structured content container built on Paper.
- Q: What does the "Form field" component cover relative to "Input"? → A: Form field is a generic wrapper: it provides the label, optional help text, and the error message, and takes any form control (input, Input, select, textarea) as its child; the label associates by wrapping, so no caller-supplied id is needed.
- Q: How should Menu, Menu item, and Tab behave? → A: All are interactive; Menu item is selectable and Tab selects among sibling panels, with hover/focus/selected/disabled states.
- Q: Should a parent Tabs component own selection and its panels, or should pages wire up Tab behaviour? → A: Add a parent Tabs component that owns selection, keyboard navigation, and its panels; Tab and its panel are children.
- Q: Should the design system stay scoped to the CMS, or be generic across the project's applications? → A: Generic; drop all CMS references, keep one shared system, and let each application differ by its look & feel and variants.
- Q: Should component variants (visual/colour changes) be listed in the spec? → A: No; the spec defines what variants and look & feel mean but does not list per-component variants or colours, and stays focused on what each component does.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build UI from a shared component set (Priority: P1)

A person building an application interface reaches for an existing component (a button, a card, a form field) instead of writing page-specific UI, so every interface behaves the same way.

**Why this priority**: The components are the design system; without them, there is nothing to reuse or document, and every interface remains bespoke.

**Independent Test**: Assemble a representative application page using only components from the design system, without bespoke UI code, and confirm each component renders and behaves correctly.

**Acceptance Scenarios**:

1. **Given** the design system's component set, **When** a builder assembles a page, **Then** every UI element on that page comes from the component set and no page-specific UI code is required.
2. **Given** the same component used in two different places, **When** both are used, **Then** they behave identically.
3. **Given** a component in different states, **When** each state is used, **Then** it renders as documented without changing the component's structure.

---

### User Story 2 - Review every component and state in one catalogue (Priority: P2)

A person building or reviewing interfaces opens a single catalogue page that shows every component in every state, with a short note on when to use it, so they can compare, choose, and spot anything missing.

**Why this priority**: The catalogue is how the design system is discovered, reviewed, and verified; it turns the component set into something usable and testable.

**Independent Test**: Open the catalogue page and confirm that every component appears, in every documented state, each with a usage note, and that nothing documented is missing.

**Acceptance Scenarios**:

1. **Given** the catalogue page, **When** it loads, **Then** it shows every component, each in all its documented states.
2. **Given** a component added to the design system, **When** the catalogue is reviewed, **Then** that component and its states are present, and a component missing from the catalogue is treated as a defect.
3. **Given** a component entry, **When** it is read, **Then** it shows the component, its states, and a short note describing when to use it.

---

### User Story 3 - Apply a consistent look & feel (Priority: P3)

A person building an interface relies on one shared look & feel — edges and corners, borders, elevation, and typography feel — so interfaces feel like the same product, while each application can still look different.

**Why this priority**: A consistent look & feel is what makes the components look like one family; it refines the components but the components still deliver value without it.

**Independent Test**: Render components from different places and confirm they share the same edges, borders, elevation, and typography feel defined by the look & feel.

**Acceptance Scenarios**:

1. **Given** the look & feel, **When** any component is rendered, **Then** it uses the look & feel's edges, borders, elevation, and typography feel rather than values of its own.
2. **Given** two components of the same kind in different places, **When** they are compared, **Then** their look & feel is identical.

---

### Edge Cases

- A component is used with an undefined or unsupported state: it must fall back to a sensible default rather than break or render unstyled.
- Content longer than expected inside a card, menu item, or button: overflow MUST be handled by wrapping or truncation rather than breaking the layout.
- A component in a disabled or non-interactive state must not respond to interaction but must remain recognisable.
- A component that should appear in the catalogue is absent, or a documented state is not shown: this is a catalogue defect and fails acceptance.
- An application selects only some variants and one look & feel: components or variants it does not use are simply absent and must not affect the ones it does use.

## Requirements *(mandatory)*

### Functional Requirements

#### Components

- **FR-001**: The design system MUST provide a documented, reusable set of UI components shared across the project's applications.
- **FR-002**: The baseline component set MUST include at least: Button, Link, Card, Paper, Input, Form field, Menu, Menu item, Tabs, Tab, Tab panel, and Dialog.
- **FR-003**: Each component MUST render every state it documents. A variant MUST change only a component's colours, never its behaviour or structure.
- **FR-004**: Interactive components MUST support at least the states: default, hover, focus, active, and disabled.
- **FR-005**: Form field MUST provide a visible label, a control area that accepts any form control, optional help text, and an error message, and MUST support at least the states: empty, focused, filled, disabled, and invalid (error). The label MUST be associated with the control without requiring a caller-supplied identifier.
- **FR-006**: Paper MUST provide the plain surface/background primitive.
- **FR-007**: Card MUST present a structured container for grouped content and MUST sit on Paper.
- **FR-008**: Menu MUST present a list of Menu items.
- **FR-009**: Menu item MUST be a selectable entry and MUST support hover, focus, selected, and disabled states.
- **FR-010**: Tabs MUST be the parent component that groups its Tab children, owns which Tab is selected, and provides keyboard navigation among them.
- **FR-011**: Tab MUST select among sibling panels and MUST expose a selected state; Tab panel MUST show the content linked to its Tab and MUST be shown only while its Tab is selected.
- **FR-012**: Dialog MUST support open and closed, MUST be dismissible, and MUST NOT allow interaction with the page behind it while open.

#### Variants and look & feel

- **FR-013**: The design system MUST define a look & feel covering edges and corners, borders, elevation, and typography feel. A look & feel MUST NOT change component behaviour.
- **FR-014**: Components MUST consume the look & feel rather than defining their own edges, borders, elevation, or typography feel, and variant colours MUST come from the defined variants rather than ad-hoc values.
- **FR-015**: Text and text-on-colour combinations MUST meet the WCAG AA minimum contrast defined in Assumptions.

#### Catalogue

- **FR-016**: Every component MUST have a catalogue entry showing it in all its states, with a short note on when to use it (SC-001, SC-005). Once variants are defined, the catalogue MUST also show their colours.
- **FR-017**: The design system MUST provide a single catalogue page that renders every component in every state.
- **FR-018**: The catalogue page MUST be reachable for the people building the project's interfaces.
- **FR-019**: A component that exists in the design system but is missing from the catalogue MUST be treated as a defect.

#### Reuse and behaviour

- **FR-020**: An application page MUST be assemblable using only design-system components, without page-specific UI code.
- **FR-021**: Interactive components MUST be operable by keyboard and MUST show a visible focus indicator.
- **FR-022**: The design system MUST be one shared system for the project's applications; differences between applications MUST be expressed through each application's look & feel and the variants it selects, not by duplicating components.

### Key Entities

- **Component**: a reusable UI element with a single documented purpose (for example Button or Card).
- **Variant**: a named set of colours that gives a component a meaning (for example `primary`, `secondary`, `danger`); shared across applications.
- **State**: a condition a component can be in (for example hover, focused, disabled, or invalid).
- **Look & feel token**: a named shared value for edges, borders, elevation, or typography feel that components consume.
- **Catalogue entry**: the documentation and live preview for one component, covering all its states (and its variant colours once defined).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the baseline components appear on the catalogue page in every documented state.
- **SC-002**: A representative page (for example a sign-in card built from Card, Form field, Input, and Button) is assembled using only design-system components, with zero page-specific UI code, and works functionally.
- **SC-003**: 100% of interactive components are operable by keyboard and show a visible focus indicator.
- **SC-004**: 100% of text and text-on-colour combinations meet the WCAG AA minimum contrast, verified by human review of the catalogue.
- **SC-005**: Every catalogue entry includes a usage note, measured as zero entries lacking a note.

## Assumptions

- The design system is a single shared system for the project's applications; the look & feel and variants each application uses are decided when that application is built.
- Applications can look different by applying different look & feel and variants while sharing the same components and behaviour.
- The look & feel and variant definitions are visual: they change appearance, never behaviour.
- The catalogue page is an internal reference surface for people building the project's interfaces, not a public page.
- The look & feel targets the classic 2008 hotel style; layout is desktop-first and fixed, and small-screen/mobile support is out of scope.
- Modern evergreen browsers are assumed, because the game client runs in them.
- Content is in English.
- The minimum contrast target is WCAG AA (4.5:1 for normal text, 3:1 for large text and interactive boundaries), judged by human review.
- The styling approach used to build the components is decided in the plan, not in this specification.
