# Phase 0 Research: Design System

Decisions resolved before design. Each entry records the decision, why it was chosen, and what else was considered. Sources: the user's implementation directives, spec.md, the constitution, and the existing workspace (`packages/cms`, `packages/client-r26`, `packages/director`).

## 1. Package identity, location, and distribution

- **Decision**: The design system is a pnpm workspace library at `packages/components`, named `@project-reborn/components`, and it exports its **Svelte source** (`.svelte` files and types) through the `exports` map. There is no compiled bundle in this slice.
- **Rationale**: Consuming Astro/Svelte apps already run a Svelte compiler, so shipping source lets them compile components with their own toolchain; it also lets Storybook and Vitest consume the same files directly. It follows the workspace rule (`@project-reborn` scope, `pnpm`) and KISS: no build pipeline to keep in sync.
- **Alternatives considered**: Precompiling to a JS bundle/`.d.ts` (adds a build step, source maps, and a second Tailwind-scanning target for no benefit at this scale); publishing to a registry (unnecessary inside the monorepo).

## 2. Svelte 5 authoring model

- **Decision**: Author every component with Svelte 5 runes (`$state`, `$props`, `$derived`, `$effect`, `$bindable`) and snippets for slot-like composition. Use the context API for compound families.
- **Rationale**: `packages/cms` is already on Svelte 5; runes are the current model and remove legacy `export let`/stores for local state.
- **Alternatives considered**: Svelte 4 syntax (obsolete in this workspace); stores for local state (unneeded, runes cover it).

## 3. Sharing Tailwind 4 across packages

- **Decision**: The package ships plain Tailwind utility classes in the components. Its own `src/styles.css` is `@import "tailwindcss";` plus `@source "./";` for Storybook and tests. A consuming app adds the package source to its Tailwind entry, e.g. `@source "../../packages/components/src";`, next to its existing `@import "tailwindcss";`.
- **Rationale**: Tailwind 4 is CSS-first; `@source` explicitly registers files to scan, so the app's build emits exactly the utility classes the components use. This matches the user's directive that apps include the design-system folder in their Tailwind configuration.
- **Alternatives considered**: A precompiled component CSS file (duplicates tokens, fights the app's own theme); a Tailwind v3 `preset`/`content` config (v4 is CSS-first and `packages/cms` already uses the Vite plugin).

## 4. Catalogue = Storybook

- **Decision**: Storybook with the Svelte + Vite framework (`@storybook/svelte-vite`) is the catalogue. Every component gets one story per state; a catalogue MDX page introduces the system. `.storybook/preview.ts` imports `src/styles.css`.
- **Rationale**: The user named Storybook as the catalogue; it renders real components, is the natural dev server for a component library, and its stories map one-to-one to the spec's catalogue requirement (FR-016, FR-017, SC-001, SC-005).
- **Alternatives considered**: A hand-built Astro catalogue page (extra app to maintain, and contradicts the directive); Vitest snapshots alone (not browsable, not a catalogue).

## 5. Modern web APIs per component

- **Dialog** — native `<dialog>` element with `showModal()`/`close()`; Esc, backdrop, and `method="dialog"` forms handled by the browser; content centered by the UA.
- **Menu / Menu item** — the HTML Popover API (`popover` attribute, `showPopover()`/`hidePopover()`/`togglePopover()`) for the list, with built-in light-dismiss; menu items are selectable entries.
- **Tabs / Tab / Tab panel** — the WAI-ARIA tabs pattern: `role="tablist"/"tab"/"tabpanel"`, `aria-selected`, `aria-controls`/`aria-labelledby`, roving `tabindex`, and Arrow/Home/End keyboard handling (there is no native element).
- **Input / Form field** — Input wraps the native `<input>`. Form field is a generic wrapper: its `<label>` wraps the label text and the control passed as children (`<FormField><Input/></FormField>`, `<select>`, `<textarea>`), so no caller-supplied id is needed; help and error render as `<span>` elements.
- **Button / Link / Paper / Card** — native `<button>`, `<a>`, and semantic containers; Paper is the plain surface and Card is layout built on it. Elevation is not defined here; it belongs to the look & feel.
- **Rationale**: Native primitives give correct accessibility, focus management, and dismissal with the least code (KISS), and this is the user's explicit "use modern web APIs" directive.
- **Alternatives considered**: Custom JS overlays and manual focus traps (more code, easy to get wrong); hand-rolled popover positioning (the Popover API handles top-layer and light-dismiss). CSS anchor positioning to attach the menu to its trigger is noted as a later visual enhancement, not a Slice 1 requirement.

## 6. Compound-component communication

- **Decision**: `src/context.ts` defines one typed Svelte context per compound family — `Tabs` (selected value + setters, registers Tabs/Tab panels) and `Menu` (open state, item selection). Children read the context they need via `getContext`.
- **Rationale**: Tabs and Menu need parent/child coordination that the spec fixes behaviourally (FR-009, FR-010, FR-011); a narrow per-family context keeps each child dependent only on what it uses (SOLID: interface segregation, dependency inversion).
- **Alternatives considered**: Prop drilling callbacks to every child (couples pages to internal wiring); a generic shared "design-system context" (a fat interface and speculative plumbing, rejected by YAGNI).

## 7. Testing approach

- **Decision**: Vitest in **browser mode** (`@vitest/browser` with Playwright), using `@testing-library/svelte`, driven by `pnpm --filter @project-reborn/components test`.
- **Rationale**: Dialog and Menu depend on native browser APIs (`<dialog>.showModal`, Popover API) that jsdom does not fully implement; a real browser verifies the actual behaviour the spec requires.
- **Alternatives considered**: Vitest + jsdom (workspace default, but cannot faithfully exercise the Popover API or modal dialog); Storybook play functions only (useful, but slower to run as the suite and couples tests to the catalogue).

## 8. Accessibility baseline

- **Decision**: Follow the WAI-ARIA Authoring Practices for the tabs pattern, expose visible focus via the future variants layer, keep native semantics (button, anchor, dialog, form controls), and give every interactive component keyboard support.
- **Rationale**: The spec requires keyboard operability and visible focus (FR-021) and non-technical clarity; native elements plus ARIA patterns are the lowest-risk route.
- **Alternatives considered**: ARIA-only reimplementations of native elements (worse semantics); deferring accessibility to the variants slice (would violate the spec).

## 9. Unstyled first-slice boundary

- **Decision**: Slice 1 components are structurally and behaviourally complete but carry no visual design: no colour, typography, spacing scale, or elevation tokens. Storybook shows them in the browser's default rendering. Variants (colour sets) and the flat/surface look & feel are deferred to Slice 2.
- **Rationale**: The user directed the first slice to be unstyled; variants and the look & feel do not change behaviour, so they can be added later without reworking the components. Visual work (variants, the look & feel, contrast) is explicitly Slice 2; Slice 1's success criteria are behavioural.
- **Alternatives considered**: Styling components now (contradicts the directive and would bake in visuals before variants exist).

## 10. Package scripts and gates

- **Decision**: `package.json` scripts — `dev`/`storybook` (Storybook dev server), `build-storybook` (static catalogue), `test` (Vitest run), `check` (`svelte-check` type check). Gates for Slice 1: `pnpm --filter @project-reborn/components test` and a clean `build-storybook`.
- **Rationale**: Names the catalogue and test surfaces the quickstart uses; keeps Slice 1 verifiable without a library build.
- **Alternatives considered**: A `build` that bundles the library (no consumer needs it since source ships).

## 11. Component API shape

- **Decision**: Components that map to a single HTML element extend the matching `svelte/elements` attribute type (`HTMLButtonAttributes` for Button, `HTMLAnchorAttributes` for Link, `HTMLInputAttributes` for Input, `HTMLAttributes<HTMLDivElement>` for Paper/Card, and the corresponding element attributes for Menu, Tab, and Dialog) and spread the remaining props onto that element. Text is rendered inside a `<span>` unless a more specific element is required. Form field is the exception: it is a generic labeled wrapper that takes its control as children.
- **Rationale**: callers get every native attribute (`aria-*`, `data-*`, `class`, event handlers) for free and the declared surface stays small; this is the idiomatic Svelte 5 pattern and keeps components thin (KISS, YAGNI).
- **Alternatives considered**: listing attributes explicitly (incomplete and high-maintenance); typing everything as `HTMLAttributes` (loses element-specific attributes such as button `type` or anchor `href`).

## Deferred (not Slice 1)

- Variants and the flat/surface look & feel (visual only) — Slice 2.
- CSS anchor positioning of the Menu popover to its trigger — visual refinement.
- A package-level Tailwind theme/token layer — arrives with variants.
