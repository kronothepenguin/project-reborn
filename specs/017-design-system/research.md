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

- **Decision**: Storybook with the Svelte + Vite framework (`@storybook/svelte-vite`) is the catalogue. Every component gets one story per prop-driven state that cannot be produced by interacting with the page (a single default story for most components; Closed and Open for Dialog); a catalogue MDX page introduces the system. `.storybook/preview.ts` imports `src/styles.css`.
- **Rationale**: The user named Storybook as the catalogue; it renders real components, is the natural dev server for a component library, and its stories map one-to-one to the spec's catalogue requirement (FR-016, FR-017, SC-001, SC-005).
- **Alternatives considered**: A hand-built Astro catalogue page (extra app to maintain, and contradicts the directive); Vitest snapshots alone (not browsable, not a catalogue).

## 5. Modern web APIs per component

- **Dialog** — native `<dialog>` element with `showModal()`/`close()`; Esc, backdrop, and `method="dialog"` forms handled by the browser; content centered by the UA.
- **Menu / Menu item** — the HTML Popover API (`popover` attribute, `showPopover()`/`hidePopover()`/`togglePopover()`) for the list, with built-in light-dismiss; menu items are selectable entries.
- **Tabs / Tab / Tab panel** — the WAI-ARIA tabs pattern: `role="tablist"/"tab"/"tabpanel"`, `aria-selected`, `aria-controls`/`aria-labelledby`, roving `tabindex`, and Arrow/Home/End keyboard handling (there is no native element).
- **Input / Form field** — Input wraps the native `<input>`. Form field is a generic wrapper: its `<label>` wraps the label text and the control passed as children (`<FormField><Input/></FormField>`, `<select>`, `<textarea>`), so no caller-supplied id is needed; help and error render as `<span>` elements.
- **Button / Link / Paper / Card** — native `<button>`, `<a>`, and semantic containers; Paper is the plain surface and Card is layout built on it. Paper is always flat: it has no elevation or shadow.
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

- **Decision**: Slice 1 components are structurally and behaviourally complete but carry no visual design: no colour, typography, or spacing-scale tokens. Storybook shows them in the browser's default rendering. Variants (colour sets) and the `flat`/`surface` themes are deferred to Slice 2.
- **Rationale**: The user directed the first slice to be unstyled; variants and the theme do not change behaviour, so they can be added later without reworking the components. Visual work (variants, the theme, contrast) is explicitly Slice 2; Slice 1's success criteria are behavioural.
- **Alternatives considered**: Styling components now (contradicts the directive and would bake in visuals before variants exist).

## 10. Package scripts and gates

- **Decision**: `package.json` scripts — `dev`/`storybook` (Storybook dev server), `build-storybook` (static catalogue), `test` (Vitest run), `check` (`svelte-check` type check). Gates for Slice 1: `pnpm --filter @project-reborn/components test` and a clean `build-storybook`.
- **Rationale**: Names the catalogue and test surfaces the quickstart uses; keeps Slice 1 verifiable without a library build.
- **Alternatives considered**: A `build` that bundles the library (no consumer needs it since source ships).

## 11. Component API shape

- **Decision**: Components that map to a single HTML element extend the matching `svelte/elements` attribute type (`HTMLButtonAttributes` for Button, `HTMLAnchorAttributes` for Link, `HTMLInputAttributes` for Input, `HTMLAttributes<HTMLDivElement>` for Paper/Card, and the corresponding element attributes for Menu, Tab, and Dialog) and spread the remaining props onto that element. Text is rendered inside a `<span>` unless a more specific element is required. Form field is the exception: it is a generic labeled wrapper that takes its control as children.
- **Rationale**: callers get every native attribute (`aria-*`, `data-*`, `class`, event handlers) for free and the declared surface stays small; this is the idiomatic Svelte 5 pattern and keeps components thin (KISS, YAGNI).
- **Alternatives considered**: listing attributes explicitly (incomplete and high-maintenance); typing everything as `HTMLAttributes` (loses element-specific attributes such as button `type` or anchor `href`).

## 12. Slice 2: surface theme, Button and Paper variants

- **Decision**: Button gains an optional `variant` prop (`"default" | "green" | "dark" | "red"`) that selects a set of **static Tailwind class strings**; omitting it renders the `default` look. Variants are defined **per component**, not shared across components. The raised face is drawn with a `::before` pseudo-element; the final colours are the nearest Tailwind palette tokens from `tools/tw-color` (the spec's hex values are the original reference). Button also gains an optional `size` prop (`"wide" | "compact"`) that selects a **static horizontal-padding class**; omitting it renders `wide`. In the surface theme Button uses `4px` vertical padding and `12px` bold typography, fixed for both sizes. The same slice also styles Paper (see the Paper subsection below).
- **Rationale**: Tailwind class strings are how the package ships styling (its source is scanned by the consumer's Tailwind build via `@source`); static literals are required for the scanner to detect them. A `::before` box gives an exact inset (1px from the border) independent of text metrics and background sizing.
- **Alternatives considered**: a hard-stop background gradient (brittle background sizing around the border and radius); a shared theme stylesheet of CSS custom properties consumed through arbitrary `var()` values (a layer the spec does not need while only Button and Paper are styled — can arrive with the `Theme` component); composing class strings at runtime (Tailwind cannot see them).

### Variant colour tokens

The final values are the nearest Tailwind palette tokens (from `tools/tw-color`, Tailwind v4.3.3); the spec's hex values are the original reference. `base` = bg-1, `face` = bg-2.

| Variant | Text | Base (bg-1) | Base (bg-1) hover | Face (bg-2) | Face (bg-2) hover |
|---|---|---|---|---|---|
| default | black | mauve-300 | olive-200 | olive-200 | white |
| green | white | lime-700 | green-600 | lime-600 | lime-500 |
| dark | white | olive-600 | neutral-500 | olive-500 | mist-400 |
| red | white | red-700 | red-600 | red-600 | red-500 |

Two source colours match poorly (`#888888`→`olive-500`, ΔE .056; `#45cb00`→`lime-500`, ΔE .046) and may read differently from the original hex.

### Surface treatment and states

- Border `2px solid black`, radius `4px`; the base colour (bg-1) fills the button and a lighter face (bg-2) fills the upper half, inset 1px from the border, via `::before`.
- Padding and typography: `4px` vertical padding, `16px`/`8px` horizontal padding (`wide`/`compact`), and `12px` bold text, fixed for the surface theme.
- Contrast is measured against the base colour; for the surface theme the face is a decorative highlight (FR-015). A future theme may require base and face together to meet AA.
- States (classic bevel): **hover** uses each variant's hover colours; **focus** is a 2px offset black outline (`focus-visible`); **active (pressed)** inverts the bevel, moving the face to the lower half; **disabled** removes the face, flattens to the base colour, dims, and shows a not-allowed cursor.
- Catalogue: one Button story per prop-driven state — each variant (`Default`, `Green`, `Dark`, `Red`) and each size (`Wide`, `Compact`) — each with a usage note. A story is one catalogue entry (FR-016, SC-001, SC-005).
- **Alternatives considered** for the states: simple darken-on-active (less faithful to the raised 3D look); browser-default focus (rejected — FR-021 wants a visible, designed indicator).

### Button size and typography

- **Decision**: Button has an optional `size` prop with values `wide` (16px horizontal padding) and `compact` (8px); omitting it renders `wide`. `size` changes only the horizontal padding — never the vertical padding, typography, colours, behaviour, or structure. Vertical padding is `4px` for both sizes, and the label is `12px` bold. These values belong to the surface theme's Button description (FR-025); a future theme defines its own.
- **Rationale**: Horizontal padding is the only dimension that varies between the two sizes, so a static `size`→class map mirrors the `variant`→class map and keeps the class strings literal for Tailwind's scanner (KISS, YAGNI). Defaulting to `wide` matches the spec's stated default horizontal padding of 16px.
- **Alternatives considered**: a numeric `padding` prop (arbitrary values Tailwind cannot scan, and no spec need); scaling font size or vertical padding with `size` (the spec fixes them for the surface theme); a shared size scale for all components (no other component has sizes yet — YAGNI).

### Paper surface treatment and variants

- **Decision**: Paper is the flat surface primitive and never has elevation or a shadow. It gains an optional `variant` prop (`"default" | "login" | "gray" | "black" | "hc" | "yellow" | "lightgreen" | "blue" | "room pattern"`) that selects a set of **static Tailwind background class strings**; omitting it renders the `default` look. In the surface theme Paper always renders a `1px` solid `black/20` border, an `8px` radius, and a `3px` bottom border in the same colour. The final colours are the nearest Tailwind palette tokens from `tools/tw-color` (the spec's hex values are the original reference).
- **Rationale**: Mirrors Button — a static `variant`→class map is the package's styling mechanism and Tailwind can only see literal classes; the border and radius are static class strings because the surface theme's Paper look is fixed for this slice.
- **Alternatives considered**: a `border` or `elevation` prop (the spec fixes Paper's border and removes elevation — YAGNI); a shared theme stylesheet of CSS custom properties (deferred until the `Theme` component arrives).

#### Paper variant colour tokens

The final values are the nearest Tailwind palette tokens (from `tools/tw-color`, Tailwind v4.3.3); the spec's hex values are the original reference. The border is `black/20` on all four sides; the bottom border is `3px` in the same colour.

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

Three source colours match poorly (`#9ed1e4`→`sky-300`, ΔE .053; `#4596a9`→`cyan-600`, ΔE .049; `#94948b`→`neutral-400`, ΔE .046) and may read differently from the original hex.

## 13. Slice 3: surface theme, Input and Link variants

- **Decision**: Input gains an optional `variant` prop (`"default" | "border"`; omitted renders `default`), an optional `size` prop (`"default" | "lg"`; omitted renders `default`), and an optional boolean `invalid` prop. `variant` selects a **static Tailwind border class** (`border` = `1px solid #555`), `size` selects a **static all-sides padding class**, and `invalid` sets the background to `#f18f9b`; Input's normal state is `bg-white text-black`. Link gains an optional `variant` prop (`"default" | "white" | "personal-info" | "nav" | "settings" | "yellow"`; omitted renders `default`) that selects a **static colour-plus-text-decoration class**; `default` is `#fc6204` underlined. Variant colours are the nearest Tailwind palette tokens from `tools/tw-color` (the spec's hex values are the original reference). Input and Link define hover, focus, and active as browser-interaction states (Input also disabled); they reuse Button's `focus-visible` outline, and their hover/active/disabled colours are not fixed in this slice. Link has no `disabled` state.
- **Rationale**: Mirrors Button and Paper — the package styles components through static Tailwind class strings that the consumer's Tailwind build can scan via `@source`; static literals are required because composed class names are invisible to the scanner. Reusing Button's focus outline keeps one visible focus treatment across the system (FR-021) with no new abstraction (KISS/YAGNI), and deferring the hover/active/disabled colours avoids inventing values the spec leaves to the theme.
- **Alternatives considered**: a runtime-composed class string (Tailwind cannot see it); inventing hover/active/darken colours (the spec defers them); a shared theme stylesheet of custom properties (deferred until the `Theme` component arrives); a `disabled` prop on Link (rejected with the user — an `<a>` cannot be natively disabled).
- **Note**: Input's `invalid` is its own prop. Form field is a layout helper (label + control + help/error message), not a state manager: it has no `invalid` prop and does not reach into its child; its `error` prop supplies the message.

### Input token and class maps

The final values are the nearest Tailwind palette tokens (from `tools/tw-color`, Tailwind v4.3.3); the spec's hex values are the original reference.

| Aspect | Spec value | Tailwind token/class | ΔE |
|---|---|---|---|
| Normal background | `#ffffff` | `bg-white` | 0 |
| Normal text | `#000000` | `text-black` | 0 |
| `border` variant border | `#555555` | `border border-neutral-600` | .0105 |
| `invalid` background | `#f18f9b` | `bg-rose-300` | .0541 |
| `size` `default` padding | `2px` (all sides) | `p-0.5` | — |
| `size` `lg` padding | `4px` (all sides) | `p-1` | — |

The `invalid` background matches poorly (`#f18f9b`→`rose-300`, ΔE .0541) and may read differently from the original hex.

### Link token and class maps

The final values are the nearest Tailwind palette tokens (from `tools/tw-color`, Tailwind v4.3.3); the spec's hex values are the original reference. Link is an explicit WCAG AA exception (FR-015): the reference colours are kept where they fall below AA.

| Variant | Colour | Text decoration | Tailwind classes | ΔE |
|---|---|---|---|---|
| default | `#fc6204` | underline | `text-orange-500 underline` | .0279 |
| white | `#ffffff` | underline | `text-white underline` | 0 |
| personal-info | `#ffffff` | none | `text-white no-underline` | 0 |
| nav | `#134787` | none | `text-blue-900 no-underline` | .0412 |
| settings | `#333333` | none | `text-olive-800 no-underline` | .0386 |
| yellow | `#ffcc00` | underline | `text-amber-300 underline` | .0163 |

Three colours match moderately (`#134787`→`blue-900`, ΔE .0412; `#333333`→`olive-800`, ΔE .0386; `#fc6204`→`orange-500`, ΔE .0279) and may read slightly differently from the original hex.

### Catalogue entries

- Input: `Default` and `Border` (one per variant), `Large` (the `lg` size; the `default` size needs no separate entry because the `Default` entry already shows it), and `Invalid` (the prop-driven `invalid` state) — four entries.
- Link: `Default`, `White`, `Personal Info`, `Nav`, `Settings`, `Yellow` — one per variant, six entries.

Each entry carries a usage note (FR-016, SC-001, SC-005). Browser-interaction states (hover, focus, active, and Input's disabled) get no entries (FR-004).

## Deferred (not this slice)

- The `flat` theme, variants for the remaining components, and contrast acceptance beyond Button/Paper/Input/Link — Slice 4.
- A `Theme` component that shares the theme through context — a later addition.
- CSS anchor positioning of the Menu popover to its trigger — visual refinement.
- A package-level Tailwind theme/token layer — arrives when more components need shared variant tokens.
