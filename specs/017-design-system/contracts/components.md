# Contract: Component APIs

Public interface every consuming application may depend on. Written for Svelte 5: props are declared with `$props()`, composition uses snippets, callbacks are passed as props (`onclick`, `onselect`, …), two-way values use `bind:`, and compound families exchange state through context (never through internal props).

Conventions:

- Native semantics first: components render or wrap the semantic element (button, a, dialog, input, div).
- Components that map to a single element extend that element's Svelte attribute type and forward the remaining attributes to it (`HTMLButtonAttributes`, `HTMLAnchorAttributes`, `HTMLInputAttributes`, `HTMLAttributes<HTMLDivElement>`, …). Callers therefore get `aria-*`, `data-*`, `class`, and event handlers for free; the tables below list only the design system's own props.
- Text renders inside a `<span>` unless a more specific element is required.
- Form field is a generic labeled wrapper: it takes its control as children rather than owning a specific control.
- Every interactive component is keyboard operable and exposes its states (see `data-model.md`).
- Slice 1 has no visual variants; props that only affect appearance arrive in Slice 2.

## Button

Renders `<button>`. Extends `HTMLButtonAttributes`; every additional attribute is forwarded to the element.

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| type | prop | `"button" \| "submit" \| "reset"` | no | default `"button"` |
| children | snippet | — | yes | button label/content |

`disabled`, `onclick`, `class`, `aria-*`, and all other button attributes are native and forwarded.

## Link

Renders `<a>`. Extends `HTMLAnchorAttributes` (`href`, `target`, `rel`, … are native).

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| children | snippet | — | yes | link label/content |

## Paper

Renders the plain surface container (FR-006) and extends `HTMLAttributes<HTMLDivElement>`. Paper defines no elevation; elevation belongs to the look & feel (Slice 2).

| Name | Kind | Type | Required | Notes |
|---|---|---|---|---|
| children | snippet | — | yes | surface content |

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

## Form field

A generic labeled wrapper (FR-005). It renders `<label>` wrapping a label `<span>` and the control passed as children, so no caller-supplied id is needed; help and error render as `<span>` elements. The control may be anything: `<input>`, `<Input>`, `<select>`, `<textarea>`.

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
| disabled | prop | `boolean` | no | reflects the disabled state on the wrapper |
| invalid | prop | `boolean` | no | reflects the invalid state on the wrapper |
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
