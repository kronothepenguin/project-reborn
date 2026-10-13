# Quickstart: Design System (Slice 1)

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

Every baseline component appears under Components, with one story per state.

## Build the catalogue

```sh
pnpm --filter @project-reborn/components build-storybook
```

Produces the static catalogue in `packages/components/storybook-static/`. Slice 1 is accepted when this builds cleanly.

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
| FR-016/FR-017/SC-001/SC-005 catalogue | Each component has an entry in every documented state, each with a usage note. |
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

## Not validated in Slice 1 (deferred to Slice 2)

- SC-004 minimum contrast and the look & feel/variants (flat/surface) — visual; belong to Slice 2.
- Variant and look & feel definitions — visual only; no behaviour change.
