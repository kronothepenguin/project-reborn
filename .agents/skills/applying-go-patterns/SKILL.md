---
name: applying-go-patterns
description: Lays out Go code the user's way, with runner, package and tool modules in a go.work workspace, a public package root over internal/, and one handler file per HTTP route on a shared Router that the root's Mount registers. Use when adding or renaming Go modules, packages, runners, HTTP routes, handlers or shared handler dependencies.
---

# Applying Go patterns

The project's knowledge names the folders, the commands and the checks.

| Task | Read |
| --- | --- |
| Add or rename an HTTP route or handler; add a shared dependency | [references/mux-patterns.md](references/mux-patterns.md) |
| Create a module, package, runner or tool | [references/module-layout.md](references/module-layout.md) |

Read only the reference of the task.

## Workflow

1. Read the reference of the task.
2. Follow its templates and mirror the closest existing package.
3. Build and vet each changed module from its own directory:

   ```sh
   cd <module-directory> && go build ./... && go vet ./...
   ```

4. After a route change, run the program and request the path.

## Gotchas

- Run Go commands inside a module directory. At the workspace root `go build ./...` fails with
  `directory prefix . does not contain modules listed in go.work`.
- A route has a Go handler file and an Astro page file with different names: `GET /orders/{id}` is `orders.go` here
  and `orders/id.astro` in `templating-astro-pages`. Leave Astro files to that skill.
