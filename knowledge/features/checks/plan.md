---
type: Plan
title: "Checks: how"
description: A shared recipe in make/check.mk gives every project its `make check`, tools/checks computes dependants, and the root Makefile runs every check.
---

# Architecture

| Project | Part |
| --- | --- |
| `make/check.mk` | The shared recipe. A project's Makefile includes it and gets `check`: the Go steps when the folder has a `go.mod`, the package scripts when it has a `package.json` |
| Each project's `Makefile` | One line that includes the shared recipe, plus the project's own steps: the store adds its generated-code check and its documentation check |
| `tools/checks` | A new Go module: the `dependants` command, and the tests of the command and of the recipe |
| Root `Makefile` | `make dependants project=<folder>` prints a project's dependants. `make check` runs every project's check, then the knowledge check. `make gates` goes |
| `tools/create` | Its templates give a new project a Makefile that includes the shared recipe |
| `.github/workflows` | CI and the release call `make check`, then `make e2e` |
| Root knowledge | A new playbook, `checks.md`: how to check one project, its dependants, everything, and the browser suites |

# Decisions

- One shared file holds the recipe, so a change to the check is made once. The user chose "One shared file".
- `make check` reads the project's files. The user: "no every project is go project, so you have to identify pnpm and
  go.mod to know what to do with make check."
- The Go steps are the ones the old gates ran, plus a build: `gofmt -l` over the tracked Go files, which lists and
  writes nothing, `go vet ./...`, `go test ./... -race` and `go build -o /dev/null ./...`, which builds and leaves no
  program in the folder.
- The package steps are the `build`, `check` and `test` scripts, each run when the package declares it.
- Steps that do not need each other run in parallel. `go vet`, the Go tests and the Go build wait for the `build`
  script, because a Go package embeds what its frontend builds and loading it fails without it. The user: "you can run go and package scripts in parallel if
  you can."
- Dependants come from a command that reads the code. The `go.mod` files leave out half of the links, because the
  workspace resolves them. The user chose "A command".
- A project is a folder. A Go import and a pnpm workspace dependency are both a link between folders, so a change in a
  frontend package reaches the Go package of the same folder, and the apps that run it.
- Every project gets `make check`: the fifteen Go modules, the JavaScript packages and `tools/tw-color`.
- `tools/tw-color` gets a `package.json` with a `test` script, so the same rule covers it. The user chose it.
- `packages/client-r26` declares `test` as `vitest`, which watches without end. It becomes
  `vitest run --passWithNoTests`, so the script ends by itself.
- The browser suites run apart: `tests/e2e` stays outside the root loop, `make e2e` runs them, and an agent runs them
  when its task says so. The user chose "Apart, as today".
- `make check` at the root replaces `make gates`: one word everywhere. The user: "i want to remove or rename gates".
- At the root the projects run one after another: the server's tests have short deadlines and a loaded machine fails
  them.
- The store's generated-code check and documentation check belong to the store's `make check`. The knowledge check
  reads every bundle, so it stays at the root.
- The recipe's tests are Go tests in `tools/checks`: each builds a tiny project in a temporary folder and runs
  `make check` on it. The user chose "One Go module: tools/checks".
