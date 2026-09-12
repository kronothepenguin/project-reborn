---
name: applying-go-patterns
description: Applies the workspace Go patterns: apps vs packages layout, module internals, and one handler file per HTTP route with a shared Router. Use when adding or renaming Go routes, handlers, shared dependencies, packages, or modules.
---

# Applying Go patterns

Read the reference that matches the task; do not load both.

| Task | Read |
| --- | --- |
| Add/rename an HTTP route or handler; add a shared dependency | [references/mux-patterns.md](references/mux-patterns.md) |
| Create a module or package; decide `apps/`, `packages/`, `cmd/`, `internal/` | [references/module-layout.md](references/module-layout.md) |

## Workflow

1. Read the reference for the task.
2. Follow its templates and examples, and mirror the closest existing package.
3. Verify from the module directory:

   ```sh
   cd <module-directory> && go build ./... && go vet ./...
   ```

4. When a route changed, run the app and request the path to confirm registration.

## Gotchas

- Never build from the workspace root: `pattern ./...: directory prefix . does not contain modules listed in go.work`.
- Go handler filenames and Astro page filenames for the same route differ (`rooms/{id}` → `rooms.go` but `rooms/id.astro`). The Astro side is owned by the `templating-astro-pages` skill; do not rename Astro files from this skill.
