# Contract: Component APIs

Public interface every consuming application may depend on. Written for Svelte 5: props are declared with `$props()`, composition uses snippets, callbacks are passed as props (`onclick`, `onselect`, …), two-way values use `bind:`, and compound families exchange state through context (never through internal props).

Conventions:

- Native semantics first: components render or wrap the semantic element (button, a, dialog, input, div).
- Components that map to a single element extend that element's Svelte attribute type and forward the remaining attributes to it (`HTMLButtonAttributes`, `HTMLAnchorAttributes`, `HTMLInputAttributes`, `HTMLAttributes<HTMLDivElement>`, …). Callers therefore get `aria-*`, `data-*`, `class`, and event handlers for free; the tables below list only the design system's own props.
- Text renders inside a `<span>` unless a more specific element is required.
- Form field is a generic labeled wrapper: it takes its control as children rather than owning a specific control.
- Every interactive component is keyboard operable and exposes its prop-driven states (see `data-model.md`).
- Slice 2 styles Button and Paper: Button adds the optional `variant` and `size` props and the surface theme; Paper adds the optional `variant` prop and its surface-theme look. Slice 3 styles Input and Link: Input adds the optional `variant` and `size` props and the optional `invalid` prop; Link adds the optional `variant` prop. Every other component remains unstyled; their variants arrive later.

## Button

Renders `<button>`. Extends `HTMLButtonAttributes`; every additional attribute is forwarded to the element.

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| type | prop | `"button" \| "submit" \| "reset"` | no | default `"button"` |
| variant | prop | `"default" \| "green" \| "dark" \| "red"` | no | default `"default"`; selects the colour set |
| size | prop | `"wide" \| "compact"` | no | default `"wide"`; selects the horizontal padding (`wide` 16px, `compact` 8px) |
| children | snippet | — | yes | button label/content |

`disabled`, `onclick`, `class`, `aria-*`, and all other button attributes are native and forwarded.

**Surface theme (Slice 2)**: the button renders as a raised 3D control — a base colour (bg-1) fills the button and a lighter face (bg-2) fills the upper half, inset 1px from the border (drawn with `::before`), with a 2px solid black border and a 4px radius. In the surface theme the button uses 4px vertical padding, 16px/8px horizontal padding (`wide`/`compact`), and 12px bold text. Colours come from the variant's Tailwind class set and horizontal padding from the size's Tailwind class (see `data-model.md`); `variant` is optional and omitted renders `default`, and `size` is optional and omitted renders `wide`. `size` changes only the horizontal padding — never the vertical padding, typography, colours, behaviour, or structure. States: **hover** uses the variant's hover colours; **focus** shows a 2px offset black outline; **active** inverts the bevel; **disabled** removes the face, flattens to the base colour, and dims. A variant or size changes only appearance, never behaviour.

## Link

Renders `<a>`. Extends `HTMLAnchorAttributes` (`href`, `target`, `rel`, … are native).

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| variant | prop | `"default" \| "white" \| "personal-info" \| "nav" \| "settings" \| "yellow"` | no | default `"default"`; selects the colour + text-decoration set |
| children | snippet | — | yes | link label/content |

**Surface theme (Slice 3)**: Link's `default` look is `#fc6204` text with an underline. The colour and text-decoration come from the variant's static Tailwind class (see `data-model.md`); `variant` is optional and omitted renders `default`. A variant changes only the colour and text decoration, never behaviour or structure. Link has no `disabled` state, because an anchor cannot be natively disabled. Link defines hover, focus, and active as browser-interaction states; it reuses Button's `focus-visible` outline, and its hover and active colours are not fixed in this slice. Link is an explicit WCAG AA exception (FR-015): its reference colours are kept where they fall below AA.

## Paper

Renders the plain flat surface container (FR-006) and extends `HTMLAttributes<HTMLDivElement>`. Paper has no elevation or shadow.

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| variant | prop | `"default" \| "login" \| "gray" \| "black" \| "hc" \| "yellow" \| "lightgreen" \| "blue" \| "room pattern"` | no | default `"default"`; selects the background colour set |
| children | snippet | — | yes | surface content |

**Surface theme (Slice 2)**: Paper is a flat surface with a 1px solid `black/20` border, an 8px corner radius, and a 3px bottom border in the same colour. The background colour comes from the variant's Tailwind class (see `data-model.md`); `variant` is optional and omitted renders `default`. Changing variant changes only the background colour, never behaviour or structure. The `room pattern` variant is a flat background, not a pattern image.

## Card

Composes Paper and extends `HTMLAttributes<HTMLDivElement>`. Renders a structured container for grouped content (FR-007).

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| header | snippet | — | no | optional header region |
| children | snippet | — | yes | card body |

## Input

Renders `<input>`. Extends `HTMLInputAttributes` (`type`, `name`, `placeholder`, `disabled`, `required`, `oninput`, `aria-*`, … are native).

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| value | prop (`bind:`) | `string` | no | two-way; forwards to the element |
| variant | prop | `"default" \| "border"` | no | default `"default"`; selects the border (`default` none, `border` 1px solid `#555`) |
| size | prop | `"default" \| "lg"` | no | default `"default"`; selects the padding on all four sides (`default` 2px, `lg` 4px) |
| invalid | prop | `boolean` | no | default `false`; when true the background is `#f18f9b` |

**Surface theme (Slice 3)**: Input renders a white background with black text in its normal state. The border comes from the `variant`'s static Tailwind class and the padding from the `size`'s static class (see `data-model.md`); `variant` and `size` are optional and omitted render `default`, and `invalid` is optional and omitted renders `false`. `variant` changes only the border, `size` changes only the padding (all four sides), and `invalid` changes only the background — none changes the others, the text colour, behaviour, or structure. Input defines hover, focus, active, and disabled as browser-interaction states; it reuses Button's `focus-visible` outline, and its hover, active, and disabled colours are not fixed in this slice.

## Form field

A generic labeled wrapper (FR-005). It is a layout helper — it keeps the label, the control, and the help/error message together; it is not a state manager. It renders `<label>` wrapping a label `<span>` and the control passed as children, so no caller-supplied id is needed; help and error render as `<span>` elements. The control may be anything: `<input>`, `<Input>`, `<select>`, `<textarea>`.

```svelte
<FormField label="Email" help="We never share it">
  <Input type="email" bind:value />
</FormField>

<FormField label="Country" error="Required">
  <select name="country">…</select>
</FormField>
```

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| label | prop | `string` | yes | visible label text (rendered in a `<span>`) |
| help | prop | `string` | no | help text (rendered in a `<span>`) |
| error | prop | `string` | no | when set, the field is invalid and the message is shown |
| disabled | prop | `boolean` | no | reflects the disabled attribute on the wrapper |
| children | snippet | — | yes | the form control |

Extends `HTMLAttributes<HTMLLabelElement>`; additional attributes (class, data-*, aria-*) are forwarded to the `<label>`.

## Menu

Parent of a Menu family. Renders a trigger and a popover list (Popover API) and provides Menu context (FR-008). Extends `HTMLAttributes<HTMLDivElement>` on its root; remaining attributes are forwarded there.

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| label | prop | `string` | no | trigger label when no `trigger` snippet |
| trigger | snippet | — | no | custom trigger content |
| disabled | prop | `boolean` | no | disables the trigger |
| onselect | callback | `(value: string) => void` | no | fired when an item is selected |
| children | snippet | — | yes | the Menu item(s) |

Context `Menu`: open state, a `select(value)` action (fires `onselect` and closes), and item registration.

## Menu item

A selectable entry within a Menu (FR-009). Renders a selectable control and reads Menu context. Extends `HTMLButtonAttributes`.

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| value | prop | `string` | yes | value passed to `onselect` |
| disabled | prop | `boolean` | no | non-selectable while true |
| selected | prop | `boolean` | no | reflects the selected state |
| children | snippet | — | yes | item label/content |

## Tabs

Parent of a Tabs family. Groups its Tab children, owns which Tab is selected, and provides keyboard navigation (FR-010). Provides Tabs context. Extends `HTMLAttributes<HTMLDivElement>`.

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| value | prop (`bind:`) | `string` | no | selected Tab value; first Tab selected when absent |
| children | snippet | — | yes | the Tab(s) and Tab panel(s) |

Context `Tabs`: current selected value, `select(value)`, and Tab/Tab-panel registration for keyboard order.

## Tab

Selects among sibling panels and exposes a selected state (FR-011). Reads Tabs context. Extends `HTMLButtonAttributes`.

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| value | prop | `string` | yes | identifies the Tab and its Tab panel |
| disabled | prop | `boolean` | no | not selectable while true |
| children | snippet | — | yes | tab label/content |

## Tab panel

Shows the content linked to its Tab and is shown only while that Tab is selected (FR-011). Reads Tabs context. Extends `HTMLAttributes<HTMLDivElement>`.

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| value | prop | `string` | yes | must match its Tab's value |
| children | snippet | — | yes | panel content |

## Dialog

A working overlay with centered content (FR-012). Renders native `<dialog>` and opens modally. Extends `HTMLDialogAttributes`.

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| open | prop (`bind:`) | `boolean` | no | `true` shows modally, `false` closes |
| label | prop | `string` | no | accessible name via `aria-label` when set |
| onclose | callback | `() => void` | no | fired when the dialog closes (Esc, backdrop, close) |
| children | snippet | — | yes | dialog content |

Behaviour: `showModal()`/`close()`; Esc, backdrop, and `method="dialog"` forms dismiss natively; the page behind is inert while open.
