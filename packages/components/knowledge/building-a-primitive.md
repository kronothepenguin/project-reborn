---
type: Playbook
title: Building a primitive
description: Where a primitive, its test and its story live in packages/components, the index that exports it, and the commands that check it, for the building-svelte-primitives skill.
---

# Skill

The `building-svelte-primitives` skill holds the rules. This playbook names their places in this repo.

# Files

| File | Place |
| --- | --- |
| Primitive | `packages/components/src/components/<name>.svelte` |
| Test | `packages/components/src/components/<name>.test.ts` |
| Story | `packages/components/src/components/<name>.stories.ts` |
| Test fixture | `packages/components/src/components/__fixtures__/<name>.svelte`, a wrapper for a test that binds a value or composes children |
| Index | `packages/components/src/index.ts`, one `export { default as <Name> }` per primitive |
| Shared context types | `packages/components/src/context.ts`, exported from the index |

- The package is `@project-reborn/components`. An app imports a primitive by name: `import { Button } from
  "@project-reborn/components";`.
- `src/components/accessibility.test.ts` checks the roles of the tabs, menu and dialog patterns.
- `src/stories/catalogue.mdx` is the catalogue page of Storybook; add the primitive to its list.
- Packaging and Tailwind: [Packaging and Tailwind](/packaging.md). Facts the pages rely on: [Primitives](/primitives.md).

# Commands

From the repo root:

```sh
make -C packages/components check                 # svelte-check, then the tests in Vitest browser mode
pnpm --filter @project-reborn/components dev      # Storybook at http://localhost:6006
make dependants project=packages/components       # the apps whose checks run next
```

# A fresh worktree

The tests run in Playwright's chromium. Install it once per machine:

```sh
pnpm --filter @project-reborn/e2e exec playwright install --with-deps chromium
```

The other first steps of a worktree are in `knowledge/checks.md`.
