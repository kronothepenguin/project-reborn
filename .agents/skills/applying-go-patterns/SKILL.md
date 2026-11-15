---
name: applying-go-patterns
description: Lays out Go code the user's way, with runner, package and tool modules in a go.work workspace on the official Go module layout, constructors New(db, opts...) with Inject and Mount, and one underscore-named handler file per HTTP route path on a shared Router. Use when adding or renaming Go modules, packages, runners, constructors, HTTP routes, handlers or handler dependencies, or when designing Go types and state.
---

# Applying Go patterns

The project's knowledge names the folders, the commands and the checks.

| Task | Read |
| --- | --- |
| Add or rename an HTTP route or handler; add a handler dependency | [references/mux-patterns.md](references/mux-patterns.md) |
| Create a module, package, runner or tool | [references/module-layout.md](references/module-layout.md) |

Read only the reference of the task.

## Design

- Return standard types. Add a type only when it adds behaviour: `Open` returns `*sql.DB`.
- A state or entity type receives the database as an argument and holds no connection.
- A request-based program reads the store on each use. In-memory state and caches are for real-time state only.
- Ports and paths come from the config file. What changes at runtime is a setting.
- A constructor is `New(db, opts...)`. What the package requires is an argument. Options are only for what differs
  between runners (production and development).
- A service another program implements is handed over with `Inject`, after `New` and before `Mount`.
- `New` and `Must` helpers may panic at startup.

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
- Go gives a meaning to file names that end in `_test`, an operating system or an architecture (`_test.go`,
  `_linux.go`, `_arm.go`). Such a handler file name gets `_route` appended: `/tools/test` is `tools_test_route.go`.
- A route has a Go handler file and an Astro page file with different names: `GET /users/{id}/orders` is
  `users_orders.go` here and `users/id/orders.astro` in `templating-astro-pages`. Leave Astro files to that skill.
