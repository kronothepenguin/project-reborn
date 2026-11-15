---
name: building-svelte-primitives
description: Builds the primitives of a shared Svelte 5 components package, such as a button, input, select, dialog, tabs or table, each in one runes file with native-attribute props, Tailwind variants, server rendering, its WAI-ARIA pattern, a behaviour test and a Storybook story. Use when adding or changing a piece of UI that knows no app, or when deciding whether a piece belongs in the shared components package.
---

# Building Svelte primitives

A primitive is a piece of UI with no knowledge of any app: a button, an input, a dialog, a table. It lives in the
shared components package from the start, also while one app uses it. A piece that knows an app, such as a member list
or a news form, stays in that app: `building-astro-components` or `adding-svelte-interactivity` builds it.

The project's knowledge names the package, its folders, its index file and its commands.

## Workflow

Copy this checklist and tick each step:

```text
Primitive:
- [ ] 1. File: <name>.svelte in the package's components folder
- [ ] 2. Export: PascalCase from the package's index
- [ ] 3. Test: <name>.test.ts beside it
- [ ] 4. Story: <name>.stories.ts beside it
- [ ] 5. Check: run the package's check, then the checks of every app that uses it
```

Run step 5 until it passes. A worked primitive with its test and story: [references/example.md](references/example.md).
Read it before the first primitive of a session.

## Rules

1. **Shape.** One lowercase kebab-case `.svelte` file per primitive (`menu-item.svelte`), with Svelte 5 runes and
   `<script lang="ts">`. The index exports it in PascalCase: `export { default as MenuItem } from "./menu-item.svelte";`.
2. **Props.** `interface Props` extends the attributes of the native element (`HTMLButtonAttributes`); `...rest` goes
   to that element. Content arrives as `children`, a `Snippet`, rendered with `{@render children()}`.
3. **Variants.** A variant is a named set of Tailwind utility classes, in a `Record` typed by the variant's union.
   Build only the variants a page uses.
4. **Server rendering.** A primitive renders on the server without JavaScript where it can, so an Astro page uses it
   with no client directive. It takes its content as children, so the server fills it at request time: a select whose
   options the server template writes.
5. **Accessibility.** An interactive primitive follows its
   [WAI-ARIA pattern](https://www.w3.org/WAI/ARIA/apg/patterns/) (tabs, menu, dialog): its roles, its keyboard and its
   focus.
6. **Test.** Each primitive has a test file. A test proves what a visitor sees or does: a disabled button ignores a
   press, Escape closes the dialog, the tab list exposes its roles. Attributes and prop defaults stay untested.
   `testing-behaviours` owns the shape of a test.
7. **Story.** Each primitive has a story that shows every variant and every state, such as disabled, open or invalid.
   Its description holds one sentence that says when to use the primitive.

## Anatomy and variant names

Read [daisyUI](https://daisyui.com/components/) and [shadcn](https://ui.shadcn.com/docs/components) for a component's
parts and its variants. They are references only: the package depends on neither.

## Gotchas

- A browser test presses a disabled control with `userEvent.click(locator, { force: true })`. A plain click waits for
  the control to become enabled and times out.

## Packaging

The package ships as Svelte source. An app picks up the package's Tailwind classes by importing the package's
stylesheet. The project's knowledge holds the details.
