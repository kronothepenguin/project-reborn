# Quickstart: Design System

How to run, build, and validate the design-system package. Commands run from the repository root unless noted.

## Prerequisites

- Node.js >= 22.12.0 and pnpm 10.30.2 (root `packageManager`).
- Dependencies installed: `pnpm install`.

## Setup

```sh
pnpm install
```

`packages/components` is already a workspace member (`packages/*` in `pnpm-workspace.yaml`); no extra registration is needed.

## Run the catalogue (Storybook)

```sh
pnpm --filter @project-reborn/components dev
# Storybook at http://localhost:6006
```

Every baseline component appears under Components, each with a story per documented prop-driven state (a story is one catalogue entry).

## Build the catalogue

```sh
pnpm --filter @project-reborn/components build-storybook
```

Produces the static catalogue in `packages/components/storybook-static/`. The slice is accepted when this builds cleanly.

## Test

```sh
pnpm --filter @project-reborn/components test
```

Vitest runs in browser mode so the native APIs behave as in production.

## Validate Slice 1 against the spec

| Spec requirement | How to validate |
|---|---|
| FR-002 baseline set exists | Storybook lists all twelve: Button, Link, Card, Paper, Input, Form field, Menu, Menu item, Tabs, Tab, Tab panel, Dialog. |
| FR-008/FR-009 Menu | Activate the trigger: a popover lists the Menu items; selecting one fires `onselect` and closes; Esc/light-dismiss closes. |
| FR-010/FR-011 Tabs | Click and arrow between Tabs: focus moves (roving tabindex) and only the selected Tab's panel is shown. |
| FR-012 Dialog | Open shows a modal centered overlay; the page behind is inert; Esc, backdrop, or a `method="dialog"` form closes it. |
| FR-005 Form field | A Form field wraps any control (`<Input>`, `<select>`, `<textarea>`) with a label, optional help, and an error message; the label associates by wrapping, so no caller-supplied id is needed. |
| FR-021 keyboard/focus | Keyboard-only walk-through reaches and operates every interactive component. |
| FR-016/FR-017/SC-001/SC-005 catalogue | Each component has an entry with a usage note; Dialog has Closed and Open entries. |
| FR-020/SC-002 reuse | A representative page can be assembled in Storybook from components alone, with no bespoke markup. |
| FR-018 catalogue reachable | The catalogue is reachable at the Storybook URL. |

## Validate consumption in an app (optional)

1. Add the package: `"@project-reborn/components": "workspace:*"` in the app's `package.json`, then `pnpm install`.
2. Register the source in the app's Tailwind entry:

   ```css
   @import "tailwindcss";
   @source "../../packages/components/src";
   ```

3. Import and render components (Button extends `HTMLButtonAttributes`; Form field wraps its control):

   ```svelte
   <script lang="ts">
     import { Button, FormField, Input } from "@project-reborn/components";
   </script>

   <FormField label="Username">
     <Input name="username" />
   </FormField>
   <Button type="submit">Sign in</Button>
   ```

## Validate Slice 2 against the spec

Run Storybook (`pnpm --filter @project-reborn/components dev`) and open **Components/Button**.

| Spec requirement | How to validate |
|---|---|
| FR-023 Button variants | Button renders four variants (`Default`, `Green`, `Dark`, `Red`); each shows a base colour with a lighter upper-half face, a 2px black border, and a 4px radius; switching variant changes only colours. |
| FR-024 surface treatment + states | Hover changes the base and face colours; keyboard focus shows a 2px offset black outline; pressing inverts the bevel; `disabled` removes the face, flattens to the base colour, and dims. |
| FR-025 Button size | Button uses 4px vertical padding and 12px bold text; the default (`wide`) horizontal padding is 16px and `compact` is 8px; switching size changes only the horizontal padding. |
| FR-016 variant and size colours in the catalogue | Each variant has its own story with a usage note, and each size (`Wide`, `Compact`) has its own story with a usage note, so all variant colours and sizes are visible in the catalogue. |
| FR-015 / SC-004 contrast | The label sits on the base colour (bg-1); each variant's text-on-base pair meets WCAG AA — default 13.88:1, green 4.96:1, dark 6.91:1, red 6.42:1 (Tailwind token values). For the surface theme the face (bg-2) is a decorative highlight and is not measured; a future theme may require base and face together. |
| FR-021 / SC-003 focus | Tab to a Button: the focus outline is visible and the button is operable by keyboard. |
| FR-003 variant changes only appearance | Compare behaviour across variants: behaviour and structure are identical. |

Variant colours are the nearest Tailwind palette tokens (see `data-model.md`); the consuming app's Tailwind build emits them because the classes are static literals in `button.svelte`.

## Deferred (later slices)

- The `flat` theme, variants for the remaining components, and contrast acceptance beyond Button — Slice 3.
- CSS anchor positioning of the Menu popover to its trigger — visual refinement.
